from PIL import Image
import os

def optimize(img_path, max_w=1600, quality=82):
    img = Image.open(img_path)
    w, h = img.size
    if w > max_w:
        img = img.resize((max_w, int(h * max_w / w)), Image.LANCZOS)
    if img.mode in ('RGBA', 'P', 'LA'):
        rgb = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        rgb.paste(img, mask=img.split()[-1] if img.mode in ('RGBA','LA') else None)
        img = rgb
    img.save(img_path, 'JPEG', quality=quality, optimize=True)

root = r"C:\Users\user\.qclaw\workspace\owen-style-v2\images"
for dirpath, _, files in os.walk(root):
    for fname in files:
        if not fname.lower().endswith(('.jpg', '.jpeg', '.png')):
            continue
        path = os.path.join(dirpath, fname)
        size_mb = os.path.getsize(path) / 1e6
        # Only optimize if > 0.3 MB
        if size_mb > 0.3:
            before = size_mb
            optimize(path)
            after = os.path.getsize(path) / 1e6
            print(f"  {os.path.relpath(path, root):<50} {before:.1f}MB -> {after:.1f}MB (省 {100*(1-after/before):.0f}%)")
        else:
            print(f"  {os.path.relpath(path, root):<50} {size_mb:.2f}MB (跳過)")

print("\n完成！")
total = sum(os.path.getsize(os.path.join(dp, f)) for dp,_,fs in os.walk(root) for f in fs) / 1e6
print(f"images/ 資料夾總大小: {total:.1f} MB")
