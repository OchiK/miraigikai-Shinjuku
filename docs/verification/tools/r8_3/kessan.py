import re,sys
num=r'(△?[\d,]+)'
def parse(f):
    lines=[re.sub(r' +',' ',l.rstrip()) for l in open(f'pdf/{f}.layout.txt')]
    rev=[];exp=[];mode=None
    for i,l in enumerate(lines):
        if '歳 入' in l and '単位' in l: mode='rev'
        if '歳 出' in l and '単位' in l: mode='exp'
        m=re.match(r'^(\d+) (\S+) '+' '.join([num]*6)+'$',l)
        if mode=='rev' and m:
            nxt=lines[i+1].strip() if i+1<len(lines) else ''
            refund=nxt if re.fullmatch(r'[\d,]+',nxt) else ''
            rev.append(list(m.groups())+[refund]); continue
        m=re.match(r'^(\d+) (\S+) '+' '.join([num]*5)+'$',l)
        if mode=='exp' and m: exp.append(list(m.groups()))
        m=re.match(r'^ ?歳 入 合 計 '+' '.join([num]*6)+'$',l)
        if m:
            nxt=lines[i+1].strip(); rev.append(['','歳入合計']+list(m.groups())+[nxt if re.fullmatch(r'[\d,]+',nxt) else ''])
        m=re.match(r'^ ?歳 出 合 計 '+' '.join([num]*5)+'$',l)
        if m: exp.append(['','歳出合計']+list(m.groups()))
    return rev,exp
def md(f):
    rev,exp=parse(f)
    out=['### 歳入（単位: 円）','','| 款 | 予算現額 | 調定額 | 収入済額 | 不納欠損額 | 収入未済額 | 予算現額と収入済額との比較 |','|------|------|------|------|------|------|------|']
    for r in rev:
        name=f'{r[0]} {r[1]}'.strip()
        out.append(f'| {name} | '+' | '.join(r[2:8])+' |')
    refunds=[(f'{r[0]} {r[1]}'.strip(),r[8]) for r in rev if r[8]]
    out+=['','還付未済額: '+'、'.join(f'{n} {v}円' for n,v in refunds)+'。','']
    out+=['### 歳出（単位: 円）','','| 款 | 予算現額 | 支出済額 | 翌年度繰越額 | 不用額 | 予算現額と支出済額との比較 |','|------|------|------|------|------|------|']
    for r in exp:
        name=f'{r[0]} {r[1]}'.strip()
        out.append(f'| {name} | '+' | '.join(r[2:7])+' |')
    return '\n'.join(out),rev,exp
if __name__=='__main__':
    for f in sys.argv[1:]:
        t,rev,exp=md(f)
        # integrity: sum of 款 equals total for key columns
        def n(x): return int(x.replace(',','').replace('△','-'))
        for col in range(2,8):
            assert sum(n(r[col]) for r in rev[:-1])==n(rev[-1][col]), (f,'rev',col)
        for col in range(2,7):
            assert sum(n(r[col]) for r in exp[:-1])==n(exp[-1][col]), (f,'exp',col)
        open(f'kessan-{f}.md','w').write(t)
        print(f, len(rev)-1,'rev款', len(exp)-1,'exp款','sums OK')
