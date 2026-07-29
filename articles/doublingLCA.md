# 关于倍增求LCA

## 朴素思路

让我们从朴素思路讲起

已知两个节点`u`和`v`，如何暴力找LCA？

显然，可以让`u`和`v`一直向上走，直到相遇

但这种做法在树退化为链时$O(n)$，太慢了，我们需要优化

## 如何想到倍增

首先我们要明白倍增是什么

倍增，就是把某一个重复操作的$1,2,4,8,16,\dots$次执行之后的结果存储起来，然后根据二进制拆分来解决任意次操作

倍增一般转移为

```
go[j][i]=go[j-1][go[j-1][i]]
```

其中`j`是`2`的幂次数，`i`是当前位置，则该语句意为

“从‘从`i`处进行`2^(j-1)`次操作后到达的位置’进行`2^(j-1)`次操作后到达的位置就是`go[j][i]`”

显然我们的“向上走”，也就是求`parent`是可重复操作

那么我们就可以用倍增存储节点向上$1,2,4,8,16,\dots$层的祖先，然后再处理，这样我们就成功把最差复杂度优化到了$O(\log n)$

但问题有两个

1. `u`和`v`深度不同怎么办
2. 如何知道`u`和`v`是否相遇

## 细节

对于第一个问题，我们很容易想到让较深节点向上跳，直到与较浅节点在同一深度，然后一起向上跳

对于第二个问题，设`LCA(u,v)`为`u`和`v`的最近公共祖先，则`u`和`v`如果跳过了`LCA(u,v)`就一定会落在`parent^x[LCA(u,v)]`上以重合

所以我们只要时刻保证`u`和`v`不重合就好了

## Code

```cpp
#include <iostream>
#include <vector>
#include <queue>
#include <cmath>
using namespace std;
int main(){
    int n;
    cin>>n;
    vector<int> parent(n+1,n);
    vector<vector<int>> child(n+1);
    vector<int> depth(n+1,0);
    depth[n]=-1;
    for(int i=1;i<n;i++){
        int x;
        cin>>x;
        parent[i]=x;
        child[x].push_back(i);
    }
    queue<int> qu;
    qu.push(0);
    while(!qu.empty()){
        int node=qu.front();
        qu.pop();
        for(const auto& u:child[node]){
            qu.push(u);
            depth[u]=depth[node]+1;
        }
    }
    vector<vector<int>> go(ceil(log2(n))+1,vector<int>(n+1,n));
    go[0]=parent;
    for(int j=1;j<go.size();j++){
        for(int i=0;i<n;i++){
            go[j][i]=go[j-1][go[j-1][i]];
        }
    }
    int q;
    cin>>q;
    while(q--){
        int x,y;
        cin>>x>>y;
        if(depth[x]>depth[y]) swap(x,y);
        for(int j=go.size()-1;j>=0;j--){
            if(depth[go[j][y]]<depth[x]) continue;
            y=go[j][y];
        }
        for(int j=go.size()-1;j>=0;j--){
            if(go[j][x]==go[j][y]) continue;
            x=go[j][x];
            y=go[j][y];
        }
        if(x==y) cout<<x<<endl;
        else cout<<parent[x]<<endl;
    }
}
```