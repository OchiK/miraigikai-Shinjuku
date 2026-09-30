"""各変種に出てくる数値が、その案件の一次資料に実在するかを確かめる。"""
import json,re,unicodedata,sys
from sources import SRC, srctext, srcraw
def jp_to_int(s):
    # 1,935億7,641万1,220円 / 4億3,701万7千円 / 2億2,990万円
    total=0; m=re.fullmatch(r'(?:([\d,]+)億)?(?:([\d,]+)万)?(?:([\d,]+)千)?([\d,]+)?円?',s)
    if not m: return None
    o,mn,k,r=[int(x.replace(',','')) if x else 0 for x in m.groups()]
    return o*10**8+mn*10**4+k*1000+r
def nums_in_source(text,raw):
    vals=set(x.replace(',','') for x in re.findall(r'\d[\d,]*',raw))
    vals|=set(x.replace(',','') for x in re.findall(r'\d[\d,]*',re.sub(r'(?<=[\d,]) (?=[\d,])','',raw)))
    # also 万/億 expressions in source (e.g. 2億2,990万円, 31万5,000円)
    for e in re.findall(r'[\d,]*億?[\d,]*万[\d,]*円?|[\d,]+億[\d,]*円?',text):
        v=jp_to_int(e.rstrip('円')+'円') if e else None
        if v: vals.add(str(v))
    return vals
data=json.load(open(sys.argv[1] if len(sys.argv)>1 else 'contents.json'))
allow=set(sys.argv[2].split(',')) if len(sys.argv)>2 else set()
bad=0
for c in data:
    key=c['bill_slug'].split('r3-')[1]
    srcs=SRC[key]; text=''.join(srctext(k) for k in srcs); have=nums_in_source(text,'\n'.join(srcraw(k) for k in srcs))
    body=unicodedata.normalize('NFKC',c['title']+'\n'+c['summary']+'\n'+c['content'])
    body=re.sub(r'https?://\S+','',body)
    found=[];approx=[]
    for e in re.findall(r'△?[\d,]*\d(?:億[\d,]*)?(?:万[\d,]*)?(?:千)?(?=円)|\d[\d,]*億[\d,]*万[\d,]*千?|\d[\d,]*万[\d,]*千?',body):
        v=jp_to_int(e.lstrip('△')+'円')
        if v is None: continue
        i=body.find(e)
        if body[max(0,i-1):i]=='約':
            approx.append((e,v)); continue
        found.append((e,v))
    for e in re.findall(r'(?<![\d,万億])\d{1,3}(?:,\d{3})+(?![\d,万億千])|(?<![\d,万億])\d{4,}(?![\d,万億千年])',body):
        found.append((e,int(e.replace(',',''))))
    for e,v in found:
        ok = str(v) in have or (v%1000==0 and str(v//1000) in have)
        if not ok and str(v) not in allow:
            bad+=1; print(f"{c['bill_slug']}:{c['difficulty_level']}  {e}  ({v})")
    for e,v in approx:
        unit=10**4
        ok=any(abs(int(h)*m-v)<unit/2+1 for h in have if len(h)>=4 for m in (1,1000))
        if not ok: bad+=1; print(f"{c['bill_slug']}:{c['difficulty_level']}  約{e}  (rounding not matched)")
print('unmatched:',bad)
