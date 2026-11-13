from PIL import Image, ImageDraw, ImageFilter
import math, os
S=1024; K=2

def grad(size, top, bottom):
    img=Image.new('RGBA',(size,size)); px=img.load()
    for y in range(size):
        t=y/(size-1)
        c=tuple(int(top[i]*(1-t)+bottom[i]*t) for i in range(3))+(255,)
        for x in range(size): px[x,y]=c
    return img

def star(d,cx,cy,r,fill):
    pts=[]
    for i in range(8):
        ang=math.pi/4*i-math.pi/2
        rr=r if i%2==0 else r*0.3
        pts.append((cx+rr*math.cos(ang),cy+rr*math.sin(ang)))
    d.polygon(pts,fill=fill)

def heart(d,cx,cy,r,fill):
    d.ellipse([cx-r,cy-r*0.9,cx,cy+r*0.1],fill=fill)
    d.ellipse([cx,cy-r*0.9,cx+r,cy+r*0.1],fill=fill)
    d.polygon([(cx-r*0.97,cy-r*0.15),(cx+r*0.97,cy-r*0.15),(cx,cy+r*1.05)],fill=fill)

def character(size, k=1.0, face=True, mono=False):
    s=size*K; c=s//2
    layer=Image.new('RGBA',(s,s),(0,0,0,0))
    L=int(0.285*s*k); W=int(0.215*s*k)
    cap=Image.new('RGBA',(s,s),(0,0,0,0)); cd=ImageDraw.Draw(cap)
    pink=(255,176,205,255)
    cd.rounded_rectangle([c-L-W,c-W,c+L+W,c+W],radius=W,fill=(255,255,255,255))
    if not mono:
        mask=Image.new('L',(s,s),0); ImageDraw.Draw(mask).rounded_rectangle([c-L-W,c-W,c+L+W,c+W],radius=W,fill=255)
        right=Image.new('RGBA',(s,s),(0,0,0,0)); ImageDraw.Draw(right).rectangle([c+int(W*0.15),c-W,c+L+W,c+W],fill=pink)
        cap.paste(right,(0,0),Image.composite(right.split()[3],Image.new('L',(s,s),0),mask))
        sh=ImageDraw.Draw(cap)
        sh.rounded_rectangle([c-L-W+int(W*0.35),c-W+int(W*0.28),c-int(W*0.2),c-W+int(W*0.5)],radius=int(W*0.12),fill=(255,255,255,255))
    cap=cap.rotate(32,resample=Image.BICUBIC,center=(c,c))
    if not mono:
        a=cap.split()[3].filter(ImageFilter.GaussianBlur(s*0.012))
        shadow=Image.new('RGBA',(s,s),(150,40,60,90)); shadow.putalpha(a.point(lambda v:int(v*0.35)))
        layer.alpha_composite(shadow,(0,int(s*0.015)))
    layer.alpha_composite(cap)
    if face and not mono:
        d=ImageDraw.Draw(layer)
        def rot(x,y):
            a=math.radians(32); dx,dy=x-c,y-c
            return (c+dx*math.cos(a)+dy*math.sin(a), c-dx*math.sin(a)+dy*math.cos(a))
        eyeR=int(W*0.24); ey=c-int(W*0.05)
        for ex in (c-int(L*0.27), c+int(L*0.27)):
            x,y=rot(ex,ey)
            d.ellipse([x-eyeR,y-eyeR*1.25,x+eyeR,y+eyeR*1.25],fill=(60,34,58,255))
            d.ellipse([x-eyeR*0.1-eyeR*0.2,y-eyeR*0.85-eyeR*0.2,x+eyeR*0.55,y-eyeR*0.1],fill=(255,255,255,255))
        for bx in (c-int(L*0.56), c+int(L*0.56)):
            x,y=rot(bx,ey+int(W*0.42))
            d.ellipse([x-W*0.2,y-W*0.11,x+W*0.2,y+W*0.11],fill=(255,120,150,210))
        sm=Image.new('RGBA',(s,s),(0,0,0,0)); sd=ImageDraw.Draw(sm)
        sd.arc([c-W*0.27,ey-W*0.04,c+W*0.27,ey+W*0.5],20,160,fill=(60,34,58,255),width=int(s*0.011))
        sm=sm.rotate(32,resample=Image.BICUBIC,center=(c,c)); layer.alpha_composite(sm)
    return layer.resize((size,size),Image.LANCZOS)

def sparkles(size, k=1.0):
    s=size*K; layer=Image.new('RGBA',(s,s),(0,0,0,0)); d=ImageDraw.Draw(layer)
    star(d,int(s*0.22),int(s*0.24),int(s*0.07*k),(255,244,180,255))
    star(d,int(s*0.80),int(s*0.20),int(s*0.045*k),(255,255,255,235))
    star(d,int(s*0.83),int(s*0.72),int(s*0.06*k),(255,244,180,255))
    heart(d,int(s*0.17),int(s*0.74),int(s*0.045*k),(255,255,255,235))
    return layer.resize((size,size),Image.LANCZOS)

def icon(size=S):
    bg=grad(size,(255,150,95),(255,95,150))
    bg.alpha_composite(sparkles(size))
    bg.alpha_composite(character(size,1.0))
    return bg.convert('RGB')

os.makedirs('assets',exist_ok=True)
icon().save('assets/icon.png')
fg=Image.new('RGBA',(S,S),(0,0,0,0)); fg.alpha_composite(sparkles(S,0.75)); fg.alpha_composite(character(S,0.78)); fg.save('assets/android-icon-foreground.png')
grad(S,(255,150,95),(255,95,150)).save('assets/android-icon-background.png')
mono=Image.new('RGBA',(S,S),(0,0,0,0)); mono.alpha_composite(character(S,0.78,face=False,mono=True)); mono.save('assets/android-icon-monochrome.png')
sp=Image.new('RGBA',(S,S),(0,0,0,0)); sp.alpha_composite(character(S,0.9)); sp.save('assets/splash-icon.png')
icon().resize((48,48),Image.LANCZOS).save('assets/favicon.png')
