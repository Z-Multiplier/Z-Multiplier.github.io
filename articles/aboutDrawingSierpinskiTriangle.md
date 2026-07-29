# 一种基于位运算绘制谢尔宾斯基箭头曲线的方法

起因是我不小心发现谢尔宾斯基三角可以一笔画 ~~并非不小心~~

然后因为`python`的`turtle`库就是一笔画工具

所以凭我仅剩的一点关于`python`的记忆应该可以写

### 观察

首先可以看到谢尔宾斯基三角是个分形且每个三角形的大小似乎具有规律，具体是`ABACABA...`的样式

然后又注意到它们的顶点都在某条线段的中点上，也就是很多$2$和$\frac{1}{2}$

这样的序列形式，再加上与$2$的相关性，不难想到可以使用`lowbit`生成三角形大小序列

让我们设一个函数`func`，它递归地绘制三角形

则第一层下，它的行为应当是：

```
1 2 1 4 1 2 1 8 1 2 1 4 1 2 1...
```

然后对于每个大于`1`的三角形，继续递归：

```
(none) (1) (none) (1 2 1) (none) (1) (none)...
```

继续：

```
(none) (none) (none) (1) (none) (none) (none)...
```

那么我们很容易就可以写出代码了

### Code

```python
import turtle

t=turtle.Turtle()

def lowbit(x:int) -> int:
    return x&-x

def drawLayer(tl:turtle,size:int,returnFlag:bool=False):
    for i in range(1,size):
        tl.forward(10)
        tl.left(120)
        tl.forward(10*lowbit(i))
        tl.right(120)
        drawLayer(tl,lowbit(i),True)
    tl.forward(10)
    if returnFlag:
        tl.right(120)
        tl.forward(10*size)
        tl.left(120)

t.speed(100)

drawLayer(t,32)

turtle.done()
```