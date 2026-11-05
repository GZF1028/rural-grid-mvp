from PIL import Image, ImageDraw, ImageFont
import os

BASE = "assets/design"
FONT_PATH = "C:\\Windows\\Fonts\\msyh.ttc"
FONT = ImageFont.truetype(FONT_PATH, 22) if os.path.exists(FONT_PATH) else ImageFont.load_default()

BG = (245, 242, 235)
INK = (31, 42, 36)
GAP = 16
LABEL_H = 44


def resize_to_height(img: Image.Image, h: int) -> Image.Image:
    w = int(img.width * h / img.height)
    return img.resize((w, h), Image.LANCZOS)


def compose(design_path: str, impl_path: str, out_path: str, left_label: str, right_label: str, height: int = 700):
    d = resize_to_height(Image.open(design_path).convert("RGB"), height)
    i = resize_to_height(Image.open(impl_path).convert("RGB"), height)
    W = d.width + i.width + GAP * 3
    H = height + LABEL_H + GAP * 2
    canvas = Image.new("RGB", (W, H), BG)
    draw = ImageDraw.Draw(canvas)
    draw.text((GAP, GAP), left_label, fill=INK, font=FONT)
    draw.text((GAP * 2 + d.width, GAP), right_label, fill=INK, font=FONT)
    canvas.paste(d, (GAP, GAP + LABEL_H))
    canvas.paste(i, (GAP * 2 + d.width, GAP + LABEL_H))
    canvas.save(out_path)
    print("saved", out_path, canvas.size)


compose(f"{BASE}/豆包A-1-1-map采用.png", f"{BASE}/shot-map.png", f"{BASE}/compare-map.png", "设计基准图（方向A 地图页）", "实现截图（网格地图）")
compose(f"{BASE}/豆包A-2-0map采用.png", f"{BASE}/shot-list.png", f"{BASE}/compare-list.png", "设计基准图（方向A 列表页）", "实现截图（档案列表）")
compose(f"{BASE}/豆包B-2-0-map采用.png", f"{BASE}/shot-detail.png", f"{BASE}/compare-detail.png", "设计基准图（方向B 详情页）", "实现截图（档案详情+走访）")
print("done")
