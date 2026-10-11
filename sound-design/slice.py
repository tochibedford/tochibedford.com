# Cuts FL's split-mixer stems into the one-shots and pad clips the site plays.
# Every sound sits in a known time slot (see make_midi.py), so slicing is: find the
# onset inside the slot, trim the tail where it decays to silence, fade, encode.
import subprocess, json, os, numpy as np
SR=48000
R='renders/Portfolio_Insert {}.wav'
OUT='../public/sounds'
os.makedirs(OUT,exist_ok=True)
man=json.load(open('manifest.json'))
def load(i):
    raw=subprocess.run(['ffmpeg','-v','error','-i',R.format(i),'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,dtype=np.float32).reshape(-1,2).copy()
def db(x): return 20*np.log10(max(x,1e-9))
stems={'keys':1,'pluck':2,'bass':3,'pad':4,'swell':5}
report=[]; files={}
for src,ins in stems.items():
    a=load(ins); slot=man['slot_seconds'][src]
    sounds=[s for s in man['sounds'] if s['source']==src]
    # one gain per stem: loudest note in the stem peaks at -3 dBFS (keeps the balance inside the instrument)
    g=10**(-3/20)/np.abs(a).max()
    a=a*g
    env=np.abs(a).max(axis=1)
    for s in sounds:
        s0=int(s['slot']*slot*SR); s1=min(len(a),int((s['slot']+1)*slot*SR))
        seg_env=env[s0:s1]
        on=np.argmax(seg_env>10**(-50/20))            # first sample above -50 dB
        start=max(0,on-int(0.002*SR))
        above=np.nonzero(seg_env>10**(-60/20))[0]
        end=min(len(seg_env),above[-1]+int(0.02*SR)) if len(above) else len(seg_env)
        clip=a[s0+start:s0+end].copy()
        fl=min(len(clip)//4,int(0.04*SR)); clip[-fl:]*=np.linspace(1,0,fl)[:,None]
        fi=int(0.001*SR); clip[:fi]*=np.linspace(0,1,fi)[:,None]
        name=s['file'].replace('.wav','.mp3')
        br='128k' if src=='pad' else '160k'
        subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ac','2','-ar',str(SR),'-i','-','-ar','44100','-c:a','libmp3lame','-b:a',br,f'{OUT}/{name}'],input=clip.astype(np.float32).tobytes(),check=True)
        dur=len(clip)/SR; pk=db(np.abs(clip).max())
        files[name]={'source':src,'key':s.get('key'),'midi':s.get('midi'),'dur':round(dur,3),'onset_ms':round(on/SR*1000,1)}
        report.append(f"{name:18s} onset {on/SR*1000:6.1f}ms  dur {dur:5.2f}s  peak {pk:6.1f}dB")
json.dump(files,open(f'{OUT}/sounds.json','w'),indent=1)
print('\n'.join(report))
