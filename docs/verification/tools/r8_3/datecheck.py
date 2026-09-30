import json,re,unicodedata,datetime as D
from sources import SRC, srctext
W='月火水木金土日'
data=json.load(open('contents.json'))
# dates that are about this explainer itself, not claims from sources
SELF={('2026','9','30'),('2026','9','16'),('2026','10','15')}
bad=0
for c in data:
    key=c['bill_slug'].split('r3-')[1]
    text=''.join(srctext(k) for k in SRC[key])
    body=unicodedata.normalize('NFKC',c['title']+'\n'+c['summary']+'\n'+c['content'])
    # weekday correctness
    for y,m,d,w in re.findall(r'(20\d\d)年(?:\(令和\d+年\))?\s?(\d{1,2})月(\d{1,2})日\(([日月火水木金土])\)',body):
        if W[D.date(int(y),int(m),int(d)).weekday()]!=w: bad+=1; print('WEEKDAY',c['bill_slug'],c['difficulty_level'],y,m,d,w)
    # 「2026年9月16日（水）から 10月15日（木）」の2つ目の日付は年を省く。
    # R8-3 の解説では会期の行だけがこの形なので、年は2026年として曜日を確かめる。
    for m,d,w in re.findall(r'から (\d{1,2})月(\d{1,2})日\(([日月火水木金土])\)',body):
        if W[D.date(2026,int(m),int(d)).weekday()]!=w: bad+=1; print('WEEKDAY2',c['bill_slug'],m,d,w)
    # presence in sources (as 令和)
    dates=set()
    for y,m,d in re.findall(r'(20\d\d)年(?:\(令和\d+年\))?\s?(\d{1,2})月(\d{1,2})日',body): dates.add((y,m,d))
    for r,m,d in re.findall(r'令和(\d+)年(\d{1,2})月(\d{1,2})日',body): dates.add((str(2018+int(r)),m,d))
    for y,m,d in dates:
        if (y,m,d) in SELF: continue
        r=int(y)-2018
        if f'令和{r}年{m}月{d}日' not in text: bad+=1; print('DATE?',c['bill_slug'],c['difficulty_level'],y,m,d)
print('issues:',bad)
