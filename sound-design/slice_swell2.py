# Slices the SKY_Keys rising-pluck swell (insert 6, "SWELL on unlock #2") into one clip per chord.
import subprocess, sys, numpy as np
OUT=sys.argv[1] if len(sys.argv)>1 else '../public/sounds'
SR=48000; SRC='renders/swell2/Portfolio_SWELL on unlock #2.wav'; SLOT=4.0
raw=subprocess.run(['ffmpeg','-v','error','-i',SRC,'-f','f32le','-ac','2','-ar',str(SR),'-'],capture_output=True,check=True).stdout
a=np.frombuffer(raw,np.float32).reshape(-1,2).copy(); a*=10**(-3/20)/np.abs(a).max(); env=np.abs(a).max(1)
for i,ch in enumerate(['fm9','dbmaj7','abmaj9','eb69']):
    s0=int(i*SLOT*SR); s1=min(len(a),int((i+1)*SLOT*SR)); e=env[s0:s1]
    on=int(np.argmax(e>10**(-50/20))); st=max(0,on-int(.002*SR))
    ab=np.nonzero(e>10**(-60/20))[0]; end=min(len(e),ab[-1]+int(.02*SR))
    c=a[s0+st:s0+end].copy(); fl=min(len(c)//4,int(.05*SR)); c[-fl:]*=np.linspace(1,0,fl)[:,None]
    subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ac','2','-ar',str(SR),'-i','-','-ar','44100','-c:a','libmp3lame','-b:a','128k',f'{OUT}/swell2-{ch}.mp3'],input=c.tobytes(),check=True)
    print(ch, f'onset {on/SR*1000:.1f}ms dur {len(c)/SR:.2f}s peak {20*np.log10(np.abs(c).max()):.1f}dB')
