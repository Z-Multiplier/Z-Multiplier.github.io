# 关于并查集

并查集，字面意思，就是允许合并和查询的集合

## 并查集是怎么来的

首先，合并操作很容易联想到图上连边

接着可以想到，如果我们保证每个连通分量都是树，判断两个点在不在一个集合内就可以利用类似LCA的想法快速求出，如果两个节点都在一个集合内，它们的祖先一定是同一个节点，让两个节点无限向上爬，直到祖先，然后比较就可以了

这个想法很好，但是它会被特殊情况卡成$O(n)$查询

比如连成一条链

## 优化

首先我们注意到，大部分情况下问题主要在于树结构可能是链而复杂度爆炸

而理想情况下，一棵树的高度可以是`1`

如何做到呢，我们只需要一边查询一边把下面的点拽上去就行了

这样我们就把均摊复杂度优化到了$O(\log n)$

还有一个问题就是，合并顺序固定的话可能会导致树的结构变歪

此时我们可以按秩合并，即按照树的高度合并（即使在路径压缩后，高度是历史高度）

这样我们就可以稳定树的结构

两者一起用时，均摊复杂度优化到$O(\alpha(n))$，近似于$O(1)$

## Code

做这种题一定要注意`0-1 indexed`问题啊……

```cpp
#include <iostream>
#include <vector>
using namespace std;
struct UnionFind{
    vector<int> parent;
    vector<int> rank;
    int size;
    UnionFind(int s){
        size=s;
        parent.resize(s);
        rank.resize(s);
        for(int i=0;i<s;i++){
            parent[i]=i;
            rank[i]=0;
        }
    }
    int find(int x){
        if(parent[x]!=x){
            parent[x]=find(parent[x]);
        }
        return parent[x];
    }
    void merge(int x,int y){
        int rootX=find(x);
        int rootY=find(y);
        if(rootX==rootY) return;
        if(rank[rootX]==rank[rootY]){
            rank[rootX]++;
            parent[rootY]=rootX;
        }
        else if(rank[rootX]<rank[rootY]){
            parent[rootX]=rootY;
        }
        else{
            parent[rootY]=rootX;
        }
    }
    bool query(int x,int y){
        return find(x)==find(y);
    }
};
int main(){
    int n,m;
    cin>>n>>m;
    UnionFind uf(n);
    for(int i=0;i<m;i++){
        int op,x,y;
        cin>>op>>x>>y;
        x--,y--;
        if(op==2){
            cout<<(uf.query(x,y)?'Y':'N')<<endl;
        }
        else{
            uf.merge(x,y);
        }
    }
    return 0;
}
```