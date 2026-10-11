# Kick = Grime God Drum Stall; 808 = 717makid Deviants 808 "Spinz", tuned to the nearest F at or below its pitch.
import subprocess, numpy as np, sys
D='source/'  # run from sound-design/: python3 new_drums.py ../public/sounds
OUT=sys.argv[1]; SR=44100
def load(p):
    raw=subprocess.run(['ffmpeg','-v','error','-i',p,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.float32).reshape(-1,2).copy()
def f0(x,a=.12,b=.9):
    m=x.mean(1)[int(a*SR):int(b*SR)]; w=np.hanning(len(m)); sp=np.abs(np.fft.rfft(m*w,n=1<<17)); fr=np.fft.rfftfreq(1<<17,1/SR)
    band=(fr>25)&(fr<250); return fr[band][np.argmax(sp[band])]
def finish(x,maxlen,name,note=''):
    env=np.abs(x).max(1); on=int(np.argmax(env>10**(-50/20))); x=x[max(0,on-int(.001*SR)):]
    env=np.abs(x).max(1); ab=np.nonzero(env>10**(-58/20))[0]; end=min(len(x),ab[-1]+int(.02*SR),int(maxlen*SR)); x=x[:end].copy()
    fl=min(len(x)//3,int(.08*SR)); x[-fl:]*=np.linspace(1,0,fl)[:,None]; x*=10**(-3/20)/np.abs(x).max()
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ac','2','-ar',str(SR),'-i','-','-c:a','libmp3lame','-b:a','160k',f'{OUT}/{name}.mp3'],input=x.astype(np.float32).tobytes(),check=True)
    print(name, f'{len(x)/SR:.2f}s', note)
k=load(D+'Grime God - Drum Stall.wav'); finish(k,0.9,'kick')
e=load(D+'Deviants 808 - Spinz.wav'); f=f0(e); midi=69+12*np.log2(f/440)
names='C C# D D# E F F# G G# A A# B'.split()
# nearest F at or above (an F below C1 would be inaudible on laptops)
target=min((17,29,41,53),key=lambda t:(t<midi-0.5, abs(t-midi))); ratio=2**((target-midi)/12)
idx=np.arange(0,len(e)-1,ratio); e=np.stack([np.interp(idx,np.arange(len(e)),e[:,c]) for c in (0,1)],1).astype(np.float32)
finish(e,2.2,'drum-2',f'measured {f:.1f} Hz = {names[round(midi)%12]}{round(midi)//12-1} ({midi:.2f}) -> F{target//12-1}, {12*np.log2(ratio):+.2f} st')
