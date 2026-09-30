"""R8-3 の案件ごとの一次資料と、抽出テキストの読み込み（numcheck.py / datecheck.py が共用）。"""
import re, unicodedata

# 案件（slug の末尾）→ 参照する一次資料（pdf/ のファイル名、submissions は提出議案一覧ページ）
SRC={
 'gian-63':['000466336','000464781'],'gian-64':['000466337','000464782','000466361'],
 'gian-65':['000466338','000464782','000466363'],'gian-66':['000466339','000464782','000466364'],
 'nintei-1':['000466361','000464782','submissions'],'nintei-2':['000466362','submissions'],
 'nintei-3':['000466363','000466338','000464782','submissions'],'nintei-4':['000466364','000466339','000464782','submissions'],
}
for g,pdf in zip(range(67,81),['000466368','000466369','000466370','000466371','000466374','000466375','000466376','000466377','000466378','000466379','000466380','000466381','000466382','000466383']):
    SRC[f'gian-{g}']=[pdf,'000464786']
def norm(t): return re.sub(r'\s+','',unicodedata.normalize('NFKC',t))
def srcfiles(k):
    return [f'pdf/{k}.txt',f'pdf/{k}.layout.txt'] if k!='submissions' else ['pdf/submissions.txt']
def srctext(k):
    return ''.join(norm(open(f).read()) for f in srcfiles(k))
def srcraw(k):
    return '\n'.join(unicodedata.normalize('NFKC',open(f).read()) for f in srcfiles(k))
