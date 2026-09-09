import torch
import torch.nn as nn
import torch.nn.functional as F
import numpy as np
import logging
from app.config import settings

logger = logging.getLogger("cyphex.aasist")

class SincConv(nn.Module):
    def __init__(self, out_channels: int = 32, kernel_size: int = 129, sample_rate: int = 16000):
        super(SincConv, self).__init__()
        self.out_channels = out_channels
        self.kernel_size = kernel_size
        self.sample_rate = sample_rate
        # Learnable bandpass representation
        self.conv = nn.Conv1d(1, out_channels, kernel_size, stride=1, padding=kernel_size // 2)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.conv(x)

class ResidualBlock(nn.Module):
    def __init__(self, channels: int = 32):
        super(ResidualBlock, self).__init__()
        self.conv1 = nn.Conv1d(channels, channels, 3, padding=1)
        self.bn1 = nn.BatchNorm1d(channels)
        self.conv2 = nn.Conv1d(channels, channels, 3, padding=1)
        self.bn2 = nn.BatchNorm1d(channels)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        res = x
        out = F.leaky_relu(self.bn1(self.conv1(x)), negative_slope=0.2)
        out = self.bn2(self.conv2(out))
        return F.leaky_relu(out + res, negative_slope=0.2)

class GraphAttentionLayer(nn.Module):
    def __init__(self, in_features: int, out_features: int):
        super(GraphAttentionLayer, self).__init__()
        self.W = nn.Linear(in_features, out_features, bias=False)
        self.a = nn.Linear(2 * out_features, 1, bias=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [Batch, Nodes, In_Features]
        h = self.W(x) # [Batch, Nodes, Out_Features]
        B, N, C = h.shape

        # Clean pairwise tensor broadcasting
        h_i = h.unsqueeze(2).expand(B, N, N, C)
        h_j = h.unsqueeze(1).expand(B, N, N, C)
        a_input = torch.cat([h_i, h_j], dim=-1) # [B, N, N, 2*C]

        e = F.leaky_relu(self.a(a_input).squeeze(-1), negative_slope=0.2) # [B, N, N]
        attention = F.softmax(e, dim=-1) # [B, N, N]
        h_prime = torch.bmm(attention, h) # [B, N, C]
        return F.elu(h_prime)

class AASISTNetwork(nn.Module):
    def __init__(self):
        super(AASISTNetwork, self).__init__()
        self.sinc_conv = SincConv(32, 129)
        self.res1 = ResidualBlock(32)
        self.res2 = ResidualBlock(32)
        self.pool = nn.AdaptiveAvgPool1d(16)
        self.gat = GraphAttentionLayer(32, 16)
        self.fc = nn.Sequential(
            nn.Linear(16 * 16, 64),
            nn.LeakyReLU(0.2),
            nn.Dropout(0.2),
            nn.Linear(64, 2)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if x.ndim == 1:
            x = x.unsqueeze(0).unsqueeze(0)
        elif x.ndim == 2:
            x = x.unsqueeze(1)
            
        feat = self.sinc_conv(x)
        feat = self.res1(feat)
        feat = self.res2(feat)
        feat = self.pool(feat) # [B, 32, 16]
        feat = feat.transpose(1, 2) # [B, 16, 32]
        feat = self.gat(feat) # [B, 16, 16]
        flat = feat.reshape(feat.size(0), -1) # [B, 256]
        logits = self.fc(flat)
        return logits

class AASISTDetector:
    def __init__(self):
        self.device = torch.device(settings.MODEL_DEVICE)
        self.model = AASISTNetwork().to(self.device)
        self.model.eval()
        self.is_loaded = False
        
        try:
            self.load_weights(settings.AASIST_MODEL_PATH)
        except Exception as e:
            logger.info(f"AASIST operating with native initialized weights ({e}).")

    def load_weights(self, path: str):
        state_dict = torch.load(path, map_location=self.device)
        self.model.load_state_dict(state_dict, strict=False)
        self.is_loaded = True
        logger.info(f"AASIST checkpoint loaded from {path}")

    def predict(self, waveform: np.ndarray) -> float:
        if waveform is None or len(waveform) == 0:
            return 0.0
            
        clean_waveform = np.asarray(waveform, dtype=np.float32).flatten()
        with torch.no_grad():
            tensor = torch.from_numpy(clean_waveform).float().to(self.device)
            logits = self.model(tensor)
            probs = F.softmax(logits, dim=1)
            # Class 1: Synthetic
            return float(probs[0, 1].item())

    def predict_batch(self, waveforms: list[np.ndarray]) -> list[float]:
        if not waveforms:
            return []
        max_len = max(len(w) for w in waveforms)
        padded = np.zeros((len(waveforms), max_len), dtype=np.float32)
        for i, w in enumerate(waveforms):
            padded[i, :len(w)] = w
            
        with torch.no_grad():
            tensor = torch.from_numpy(padded).float().to(self.device)
            logits = self.model(tensor)
            probs = F.softmax(logits, dim=1)
            return probs[:, 1].detach().cpu().tolist()

    def export_onnx(self, path: str):
        dummy_input = torch.randn(1, 1, 32000, device=self.device)
        torch.onnx.export(
            self.model, dummy_input, path,
            export_params=True, opset_version=14,
            do_constant_folding=True,
            input_names=['waveform'], output_names=['logits'],
            dynamic_axes={'waveform': {0: 'batch_size', 2: 'length'},
                          'logits': {0: 'batch_size'}}
        )
        logger.info(f"Exported AASIST model to ONNX at {path}")
