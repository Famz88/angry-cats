"""Generate native app icons; run before XcodeGen (requires Pillow)."""
from pathlib import Path
import json
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parents[1]
s=1024
im=Image.new('RGB',(s,s),'#28432a'); d=ImageDraw.Draw(im)
def points(seq): return [(int(x*s/108),int(y*s/108)) for x,y in seq]
d.polygon(points([(23,56),(22,20),(42,35),(66,35),(86,20),(85,58),(80,75),(68,85),(42,85),(28,75)]), fill='#ffab36',outline='#542c39',width=35)
d.polygon(points([(31,48),(48,56),(43,64),(33,60)]),fill='#fff3dc')
d.polygon(points([(60,56),(77,48),(75,60),(65,64)]),fill='#fff3dc')
d.ellipse((390,625,640,790),fill='#fff3dc')
d.polygon(points([(49,68),(59,68),(54,74)]),fill='#542c39')
for x in [39,65]: d.rectangle((x*s//108,54*s//108,(x+5)*s//108,62*s//108),fill='#542c39')
assets=root/'ios/AngryCats/Assets.xcassets'; icon=assets/'AppIcon.appiconset';icon.mkdir(parents=True,exist_ok=True)
(assets/'Contents.json').write_text(json.dumps({'info':{'author':'xcode','version':1}}))
# Explicit sizes support iOS 15 and iPad as well as store submission.
images=[]
for idiom,sizes in [('iphone',[(20,2),(20,3),(29,2),(29,3),(40,2),(40,3),(60,2),(60,3)]),('ipad',[(20,1),(20,2),(29,1),(29,2),(40,1),(40,2),(76,1),(76,2),(83.5,2)]),('ios-marketing',[(1024,1)])]:
 for size,scale in sizes:
  px=int(size*scale); name=f'{idiom}-{size}-{scale}.png'; im.resize((px,px),Image.Resampling.LANCZOS).save(icon/name)
  images.append({'idiom':idiom,'size':f'{size}x{size}','scale':f'{scale}x','filename':name})
(icon/'Contents.json').write_text(json.dumps({'images':images,'info':{'author':'xcode','version':1}},indent=2))
