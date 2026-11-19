from PIL import Image, ImageDraw, ImageFilter
import math
S=1024; K=2  # supersample

def grad(size, top, bottom):
    img=Image.new('RGBA',(size,size))
    px=img.load()
    for y in range(size):
        t=y/(size-1)
        c=tuple(int(top[i]*(1-t)+bottom[i]*t) for i in range(3))+(255,)
        for x in range(size): px[x,y]=c
    return img

def tiedye(size):
    s=size*K; u=s/200
    img=Image.new('RGBA',(s,s),(155,92,255,255)); d=ImageDraw.Draw(img)
    cols=[((255,59,92),150),((255,138,31),125),((255,210,31),100),((46,212,122),78),((42,168,255),58),((155,92,255),38)]
    for col,r in cols:
        d.ellipse([s/2-r*u,s/2-r*u,s/2+r*u,s/2+r*u],fill=col+(255,))
    return img.resize((size,size),Image.LANCZOS)

def character(size, k=1.0, face=True, mono=False):
    """Peace-and-love pill with a joint, centered in a size x size transparent canvas (supersampled)."""
    s=size*K; c=s/2; u=s/200*k
    layer=Image.new('RGBA',(s,s),(0,0,0,0))
    cx,cy=c,c+8*u
    box=[cx-66*u,cy-31*u,cx+66*u,cy+31*u]
    cap=Image.new('RGBA',(s,s),(0,0,0,0)); cd=ImageDraw.Draw(cap)
    cd.rounded_rectangle(box,radius=31*u,fill=(255,255,255,255))
    if not mono:
        mask=Image.new('L',(s,s),0); ImageDraw.Draw(mask).rounded_rectangle(box,radius=31*u,fill=255)
        right=Image.new('RGBA',(s,s),(0,0,0,0)); ImageDraw.Draw(right).rectangle([cx,cy-31*u,cx+66*u,cy+31*u],fill=(55,214,122,255))
        cap.paste(right,(0,0),Image.composite(right.split()[3],Image.new('L',(s,s),0),mask))
        gl=Image.new('RGBA',(s,s),(0,0,0,0)); ImageDraw.Draw(gl).rounded_rectangle([cx-44*u,cy-26*u,cx+44*u,cy-18*u],radius=4*u,fill=(255,255,255,150))
        gl.putalpha(Image.composite(gl.split()[3],Image.new('L',(s,s),0),mask)); cap.alpha_composite(gl)
    if face and not mono:
        d=ImageDraw.Draw(cap); ink=(27,16,48,255); w=int(3.2*u)
        for ex in (-10,16):
            d.arc([cx+(ex-8)*u,cy-12*u,cx+(ex+8)*u,cy+4*u],195,345,fill=ink,width=int(4.2*u))
        for bx in (-14,24):
            d.ellipse([cx+(bx-5)*u,cy+3*u,cx+(bx+5)*u,cy+13*u],fill=(255,150,185,255))
        d.arc([cx-6*u,cy+4*u,cx+14*u,cy+22*u],20,160,fill=ink,width=w)
        # peace sign
        pr=10*u; px,py=cx-40*u,cy-2*u
        d.ellipse([px-pr,py-pr,px+pr,py+pr],outline=ink,width=int(2.6*u))
        d.line([px,py-pr,px,py+pr],fill=ink,width=int(2.6*u))
        d.line([px,py,px-7*u,py+7*u],fill=ink,width=int(2.6*u)); d.line([px,py,px+7*u,py+7*u],fill=ink,width=int(2.6*u))
        # joint (tilted a little, tucked at the mouth) + smoke
        j=Image.new('RGBA',(s,s),(0,0,0,0)); jd=ImageDraw.Draw(j)
        jx,jy=cx+12*u,cy+13*u
        jd.rounded_rectangle([jx,jy-3*u,jx+30*u,jy+3.5*u],radius=3*u,fill=(246,238,220,255))
        jd.rounded_rectangle([jx+27*u,jy-3*u,jx+33.5*u,jy+3.5*u],radius=3*u,fill=(255,90,31,255))
        j=j.rotate(-10,resample=Image.BICUBIC,center=(jx,jy)); cap.alpha_composite(j)
        import math as m
        for t in range(0,31):
            f=t/30; x=cx+(46+6*m.sin(f*6.0))*u; y=cy+(10-24*f)*u; r=(1.6+1.6*f)*u
            d.ellipse([x-r,y-r,x+r,y+r],fill=(255,255,255,int(240-120*f)))
    cap=cap.rotate(28,resample=Image.BICUBIC,center=(c,c))
    if not mono:
        a=cap.split()[3].filter(ImageFilter.GaussianBlur(s*0.01))
        shadow=Image.new('RGBA',(s,s),(0,0,0,255)); shadow.putalpha(a.point(lambda v:int(v*0.4)))
        layer.alpha_composite(shadow,(0,int(s*0.03)))
    layer.alpha_composite(cap)
    return layer.resize((size,size),Image.LANCZOS)

def icon(size=S):
    bg=tiedye(size)
    bg.alpha_composite(character(size,1.0))
    return bg.convert('RGB')

import os
os.makedirs('assets',exist_ok=True)
icon().save('assets/icon.png')
# Android adaptive: transparent foreground in safe zone + gradient background image
fg=Image.new('RGBA',(S,S),(0,0,0,0)); fg.alpha_composite(character(S,0.78)); fg.save('assets/android-icon-foreground.png')
tiedye(S).save('assets/android-icon-background.png')
# monochrome: silhouette
mono=Image.new('RGBA',(S,S),(0,0,0,0)); mono.alpha_composite(character(S,0.78,face=False,mono=True)); mono.save('assets/android-icon-monochrome.png')
# splash: character on transparent
sp=Image.new('RGBA',(S,S),(0,0,0,0)); sp.alpha_composite(character(S,0.9)); sp.save('assets/splash-icon.png')
icon().resize((48,48),Image.LANCZOS).save('assets/favicon.png')
