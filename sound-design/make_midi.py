# Writes one MIDI file per instrument. 120 BPM, 480 ticks/beat. Every sound sits in its own
# fixed-length slot, so the rendered WAV can be cut into one-shots by time alone.
import struct, json, os
TPB=480; BPM=120
def vlq(n):
    out=[n&0x7f]; n>>=7
    while n: out.append((n&0x7f)|0x80); n>>=7
    return bytes(reversed(out))
def write(path, events, name):
    # events: list of (start_beat, dur_beats, [midi notes], velocity)
    ev=[]
    for s,d,notes,vel in events:
        for n in notes:
            ev.append((round(s*TPB),0x90,n,vel)); ev.append((round((s+d)*TPB),0x80,n,0))
    ev.sort(key=lambda e:(e[0], e[1]==0x90))
    trk=b'\x00\xff\x51\x03'+struct.pack('>I',60000000//BPM)[1:]
    trk+=b'\x00\xff\x03'+vlq(len(name))+name.encode()
    t=0
    for tick,st,n,v in ev:
        trk+=vlq(tick-t)+bytes([st,n,v]); t=tick
    trk+=b'\x00\xff\x2f\x00'
    data=b'MThd'+struct.pack('>IHHH',6,0,1,TPB)+b'MTrk'+struct.pack('>I',len(trk))+trk
    open(path,'wb').write(data)

# F minor pentatonic: F Ab Bb C Eb
PENT=[0,3,5,7,10]
def pent(root,count): return [root+PENT[i%5]+12*(i//5) for i in range(count)]
rows={
  'keys':  dict(notes=pent(65,10), keys='qwertyuiop', slot=8, dur=2, vel=96),   # F4 up, SKY_Keys
  'pluck': dict(notes=pent(53,9),  keys='asdfghjkl',  slot=8, dur=1, vel=100),  # F3 up, Analog Lab
  'bass':  dict(notes=pent(41,7),  keys='zxcvbnm',    slot=8, dur=1.5, vel=110),# F2 up, Analog Lab
}
manifest={'bpm':BPM,'slot_seconds':{},'sounds':[]}
for name,r in rows.items():
    ev=[(i*r['slot'],r['dur'],[n],r['vel']) for i,n in enumerate(r['notes'])]
    write(f'midi/{name}.mid',ev,name)
    manifest['slot_seconds'][name]=r['slot']*60/BPM
    for i,(n,k) in enumerate(zip(r['notes'],r['keys'])):
        manifest['sounds'].append({'file':f'{name}-{k}.wav','source':name,'slot':i,'midi':n,'key':k})

# Pad: four chords in F minor, each held 16 beats (8 s) in its own 24-beat slot.
# Fm9, Dbmaj7(#11-ish voicing), Abmaj9, Eb6/9. Voiced low-mid so it sits under the keys.
pad=[
  ('fm9',   [41,53,56,60,63,67]),   # F2 F3 Ab3 C4 Eb4 G4
  ('dbmaj7',[37,49,53,56,60,65]),   # Db2 Db3 F3 Ab3 C4 F4
  ('abmaj9',[44,51,55,58,60,63]),   # Ab2 Eb3 G3 Bb3 C4 Eb4
  ('eb69',  [39,51,55,58,60,65]),   # Eb2 Eb3 G3 Bb3 C4 F4
]
write('midi/pad.mid',[(i*24,16,notes,80) for i,(_,notes) in enumerate(pad)],'pad')
manifest['slot_seconds']['pad']=24*60/BPM
for i,(n,_) in enumerate(pad): manifest['sounds'].append({'file':f'pad-{n}.wav','source':'pad','slot':i})
# Unlock swell: same four chords, short and bright, 2 beats each in 8-beat slots.
write('midi/swell.mid',[(i*8,2,[x+12 for x in notes[1:]],100) for i,(_,notes) in enumerate(pad)],'swell')
manifest['slot_seconds']['swell']=8*60/BPM
for i,(n,_) in enumerate(pad): manifest['sounds'].append({'file':f'swell-{n}.wav','source':'swell','slot':i})
json.dump(manifest,open('manifest.json','w'),indent=1)
print(json.dumps(manifest['slot_seconds']))
