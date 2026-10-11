# Picks ten one-shots from the conz.xo trapties kit for keys 1-0, tunes the 808 to F,
# trims tails, matches peaks and writes public/sounds/drum-<digit>.mp3
import subprocess, numpy as np, os, json
K=os.path.expanduser('~/mnt/Documents/new samples/! @conz.xo - trapties vol. 2 (deluxe)/drumkit/')
P='@conz.xo - '
G=os.path.expanduser('~/mnt/Documents/new samples/ś&$ - Zxph Xllxs Presents - The Grime God Kit/')
picks={'2':('808',P+'bang 808 (fav).wav',1.4),'3':('snares',P+'traptied.wav',1.0),'4':('claps',P+'clean zay clap.wav',1.0),
 '5':('hh',P+'zay hh.wav',0.5),'6':('hh',P+'sharp hat.wav',0.5),'7':('oh',P+'trapties oh.wav',1.2),'8':('percs',P+'rim perc.wav',0.8),
 '9':('percs',P+'tom perc.wav',1.2),'0':('crashes + cymbals',P+'zaytoven crash.wav',2.4)}
# kick candidates for key 1, written as kick-1..kick-4 so the site can switch between them
kicks={'kick-1':G+'śśś - Grime God - Kick Kit/Grime God - Kick 1.wav','kick-2':G+'śśś - Grime God - Kick Kit/Grime God - Kick 2.wav',
 'kick-3':G+'śśś - Grime God - Kick Kit/Grime God - 909 Kick.wav','kick-4':G+'#Grime God - Early Grime Kit/Grime God - Genius Kick.wav'}
SR=44100
def load(path):
    raw=subprocess.run(['ffmpeg','-v','error','-i',path,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.float32).reshape(-1,2).copy()
def f0(x):
    m=x.mean(1); seg=m[int(.15*SR):int(.6*SR)]
    if len(seg)<4096: seg=m[:min(len(m),int(.4*SR))]
    w=np.hanning(len(seg)); sp=np.abs(np.fft.rfft(seg*w,n=1<<16)); fr=np.fft.rfftfreq(1<<16,1/SR)
    band=(fr>30)&(fr<200); return fr[band][np.argmax(sp[band])]
out='../public/sounds'; rep={}
jobs=[(k,K+f+'/'+n,ml,f'drum-{k}') for k,(f,n,ml) in picks.items()]+[('k',p,0.9,name) for name,p in kicks.items()]
for k,path,maxlen,outname in jobs:
    x=load(path)
    note=''
    if k=='2':
        f=f0(x); midi=69+12*np.log2(f/440)
        # nearest F (F1=29, F2=41)
        target=min([29,41],key=lambda t:abs(t-midi)); ratio=2**((target-midi)/12)
        idx=np.arange(0,len(x)-1,ratio); x=np.stack([np.interp(idx,np.arange(len(x)),x[:,c]) for c in (0,1)],1).astype(np.float32)
        note=f'{f:.1f}Hz (midi {midi:.2f}) -> F{(target//12)-1} ({target}) shift {12*np.log2(ratio):+.2f} st'
    env=np.abs(x).max(1); on=int(np.argmax(env>10**(-50/20)))
    x=x[max(0,on-int(.001*SR)):]; env=np.abs(x).max(1)
    above=np.nonzero(env>10**(-55/20))[0]; end=min(len(x),(above[-1] if len(above) else len(x))+int(.02*SR),int(maxlen*SR))
    x=x[:end]; fl=min(len(x)//3,int(.06*SR)); x[-fl:]*=np.linspace(1,0,fl)[:,None]
    x*=10**(-3/20)/np.abs(x).max()
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ac','2','-ar',str(SR),'-i','-','-c:a','libmp3lame','-b:a','160k',f'{out}/{outname}.mp3'],input=x.tobytes(),check=True)
    rep[outname]=f'{path.split("/")[-1]}  {len(x)/SR:.2f}s {note}'
print('\n'.join(f'{k}: {v}' for k,v in rep.items()))
