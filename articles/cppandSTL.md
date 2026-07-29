# 竞赛C++STL与现代特性指北

如你所见，这是一篇现代特性指北，为的就是解决你不会现代C++特性的问题，~~虽然大部分是STL~~，主要是想到哪写到哪，所以顺序可能不规则，建议使用目录索引

本文默认读者具有基本的STL知识，如`make_pair`等，但也尽量详细

语气多少带着点不正经，还穿插了一些小彩蛋，希望你读起来不累

#### 目录

---
目录符号对照表：
|符号|含义|
|:-:|:-:|
|[cont]|STL容器|
|[algo]|STL算法|
|[trick]|技巧|
|[hbt]|编码习惯|
|[fast]|合理加快写代码速度|
|[17]|C++17标准引入，评测无法使用|
|[freq:X]|常用度，$1\le X \le 5$|
|[#...]|场景索引|

---

1. **[std::vector](#stdvector) -- \[cont] \[freq:5] \[#存储不定数量数据]**
2. **[std::pair & std::tuple](#stdpair--stdtuple) -- \[cont] \[freq:5] \[#存储数据聚合体]**
3. **[range based for](#range-based-for) -- \[trick] \[fast] \[#不需要下标信息遍历STL容器]**
4. **[扔掉垃圾define](#扔掉垃圾define) -- \[hbt]**
5. **[std::iota](#stdiota) -- \[algo?] \[trick] \[fast] \[freq:2] \[#初始化递增数组]**
6. **[std::sort的进阶用法](#stdsort) -- \[algo] \[freq:5] \[#自定义排序]**
7. **[std::partial_sort](#stdpartial_sort) -- \[algo] \[freq:3] \[#搜索前n小元素]**
8. **[容器中找minmax和nth](#stdmax_elementstdnth_element和stdmin_element) -- \[algo] \[fast] \[freq:4] \[#找到特定大小元素]**
9. **[结构化绑定](#结构化绑定) -- \[trick] \[fast] \[17]**
10. **[std::unordered_map](#stdunordered_map) -- \[cont] \[freq:4] \[#离散化或哈希]**
11. **[std::string](#stdstring) -- \[cont] \[freq:5] \[#存储字符串]**
12. **[std::set & multiset](#stdset--stdmultiset) -- \[cont] \[freq:3] \[#维护有序数组，快速查询]**
13. **[std::clamp](#stdclamp) -- \[algo?] \[17] \[trick] \[#杀死所有越界访问]**
14. **[各种不需要自己写的gcd](#stdgcd和__gcd) -- \[algo?] \[17] \[trick] \[fast] \[#求最大公约数]**
15. **[std::deque](#stddeque) -- \[cont] \[freq:3] \[#滑动窗口，或任何需要首尾删改的场景，或者需要queue的场景]**
16. **[如何优雅地命名](#关于命名) -- \[hbt] \[trick]**
17. **[std::priority_queue](#stdpriority_queue) -- \[cont] \[freq:3] \[#对数取最大最小值]**
18. **[std::chrono](#stdchrono) -- \[trick] \[#卡常测代码速]**
19. **[lambda表达式](#lambda) -- \[trick] \[#自定义比较器，或不想写在全局的函数]**
20. **[通用二分查找](#通用二分查找) -- \[algo] \[freq:3] \[#快速查找某个元素/某个元素的后继]**
21. **[std::accumulate](#stdaccumulate) -- \[algo] \[trick] \[#对一个容器内的全体元素操作并获取返回值]**
22. **[std::partial_sum & std::adjacent_difference](#stdpartial_sum--stdadjacent_difference) -- \[algo?] \[trick] \[fast] \[#前缀和与差分]**
23. **[std::bitset](#stdbitset) -- \[cont] \[freq:3] \[#  高速且支持位运算能当数字用的`array<bool>`]**
24. **[std::array](#stdarray) -- \[cont] \[freq:2] \[#固定长度且需要传入函数的数组]**
25. **[一些卡常技巧](#卡常技巧) -- \[trick]**
26. **[std::stack](#stdstack) -- \[cont] \[freq:2] \[#非递归DFS]**
27. **[通用迭代器操作](#通用迭代器操作) -- \[trick] \[freq:3]**
28. **[std::random](#stdrandom) -- \[algo?] \[trick] \[#啊啊啊啊我treap又被随机种子坑了]**
29. **[重载输入输出流](#重载输入输出流) -- \[trick] \[#大量打印、读入结构体、STL]**
30. **[assert与更多debug](#assert与更多debug) -- \[trick]**

---

## std::vector

相信这个无需过多介绍了

这位堪称全能战士，适用范围极广，还能几乎无缝把数据传给其它STL，有一堆数据要存？先上`vector`，不行再说

头文件为`<vector>`

### 构造函数

`vector`有多种构造函数选择

#### vector()

此时构造的为空向量，即不含任何元素的向量

#### vector(size)

此时构造大小为`size`的全零值向量，与C-style静态数组不同的是，此时其中的元素为零值，也即初始化值，例如`int`会被初始化为`0`，`bool`会被初始化为`false`

#### vector(size,val)

构造大小为`size`，其中每个值都是`val`的`vector`

#### vector(iter,iter)

这是一种比较冷门的方法，效率较低，下称第一个迭代器为`begin`，第二个迭代器为`end`，则：

- `begin`和`end`必须是输入迭代器（i.e.大部分迭代器）
- 构造行为为将$[begin,end)$内的所有元素**复制**到`vector`内
- 效率$O(n)$

通俗地讲，此构造函数的行为为

```cpp
//...
for(auto it=begin;it!=end;it++){
    this->push_back(*it);
}
//...
```

### std::vector::push_back()

`vector`添加元素的基本方法就是`push_back`，作用是将元素追加到列表末尾，效率$O(1)$

例如，`vector<int> v={1,2,3,4,5}`，执行`v.push_back(6)`后`v`的内容为`{1,2,3,4,5,6}`

### std::vector::pop_back()

弹出最后一个元素，效率$O(1)$，有时有奇效

### std::vector::emplace_back()

这种方法与`push_back()`基本无异，区别在于此方法为“原地构造”，可以节省拷贝时间，例如：

```cpp
struct Node{
    int first;
    int second;
    char character;
    Node(int f,int s,char c):first(f),second(s),character(c){};
    //假装这里有一堆很大的函数
    //...
};

vector<Node> v;

v.push_back({1,2,'p'});//复制，较耗时
v.emplace_back(1,2,'e');//直接构造，耗时短
```

此时，`Node`内有许多成员函数，拷贝成本较高，因此我们选择`emplace_back`，事实上，只要类型不是内置类型（`int`,`char`,`bool`,etc.），使用`emplace_back()`总是没错的，效率不会更低，还能节省两个花括号， ~~这非常重要，不是吗~~

### std::vector::size()

以$O(1)$的复杂度返回**元素个数**

~~Simple, innit?~~

### std::vector::empty()

返回`vector`是否为空，约等价于`v.size()==0`

### std::vector::resize()

重设`vector`的大小，如`v.resize(5)`会将`v`的大小变为`5`，并保留下标`0~4`的所有元素（或者，推入零值直到`v.size()==5`）

### std::vector::reserve()

预分配内存，不影响`size`，常用于优化`push_back`和`emplace_back`的速度并不影响按`size`遍历，然而需要预先知道阈值，否则可能`MLE`

### std::vector::shrink\_to\_fit()

将`vector`缩容为刚好容纳所有元素的大小，注意由于零值也是元素，它并不会删除零值（即，缩容到`v.size()`），然而大部分情况下在此之前就已经`MLE`故而使用较少，非必要不要碰

### std::vector::assign()

`assign(size,val)`可以理解为二次初始化，将向量变为大小为`size`，所有元素都是`val`的向量，~~可以省一个循环~~

### std::vector::operator[] && std::vector::at()

随机访问两兄弟，`operator[]`：

- 速度较快
- 不做越界检查，越界访问属于未定义行为，易引起RE
- 符合直觉，~~毕竟静态数组也是这么写的，不是吗~~

`at()`：

- 速度稍慢
- 做越界检查，越界会抛出`std::out_of_range`，~~虽然不catch还是RE~~
- 想不到用

综上，建议在调试阶段使用`at()`，抛出异常后会被`std::terminate`捕捉并打印到控制台，利于发现问题，~~毕竟你也不想盯着屏幕几个小时最后发现越界导致RE吧~~，若极限卡常，可以使用`operator[]`

### std::vector::insert()&erase()

组中编辑两兄弟，效率$O(n)$（移动之后的所有元素），非必要不用

`v.insert(pos,val)`会在`pos`处插入`val`，其中`pos`是迭代器，若要使用下标，可以使用`v.begin()+idx`，其中`idx`为下标

`v.erase(pos)`同上，也可以使用`v.erase(begin,end)`删除区间，当然，`begin`和`end`也必须是迭代器

### std::vector::clear()

可以清空整个数组，就这样，但是内存不释放，之后的`push_back`和`emplace_back`略快（与`reserve()`同理）

### std::vector::swap()

这也是一个冷门用法，可以$O(1)$交换两个`vector`的元素，但是不经常见到使用场景

如`vec1.swap(vec2)`

### iterators

`vector`（和大量其它STL容器）有以下获取迭代器的方法：

1. `begin()/end()`返回头/尾迭代器，整个`vector`的内容为$[begin,end)$
2. `rbegin()/rend()`返回反向遍历迭代器，整个`vector`的内容为$(rend,rbegin]$（逻辑上），但一般反过来写，即$[rbegin,rend)$

### ？！坑坑！？

注意！`vector<bool>`有特化，其返回的不是`bool&`而是`vector<bool>::reference`，我的建议是，既然你都`vector<bool>`了，不如试试`bitset`，或者，换成`vector<char>`不会多用多少内存，但不必和STL的代理类打交道

## std::pair & std::tuple

这两位相信大家都用过，如果你有一堆数据聚合成的总体但没有成员函数，那就不必使用`struct`，可以使用`pair`&`tuple`，简单但有效

位于头文件`<utility>`

### pairs

可以使用两种类型定义一个pair，pair会同时持有两个类型的元素，通过`first`和`second`访问两个元素，例如：

```cpp
pair<int,char> pic(1,'a');

cout<<pic.first<<endl;//1

cout<<pic.second<<endl;//a
```

当然，两种类型可以重复

### tuples

可以使用任意多类型定义一个tuple，tuple同时持有所有这些类型的元素，但访问需要`std::get`/`std::tie`

```cpp
tuple<int,int,int> tiii(1,2,3);

int a,b,c;
std::tie(a,b,c)=tiii;//a==1,b==2,c==3;

std::get<0>(tiii);//==1
std::get<1>(tiii);//==2

//...
```

## range based for

遍历一个STL容器有什么方法？

如果是`vector`，`array`，可以用常规`for`按下标遍历，但如果是`set`呢

此时就是范围`for`循环出场的时候了

范围`for`的语法是

```cpp
vector<int> example={1,2,3,4,5};
for(int val:example){
    cout<<val<<endl;//1 2 3 4 5
}
for(int& val:example){//加引用，速度更快，尤其对于大结构体等
    cout<<val<<endl;//同上
}
for(const int& val:example){//加常量声明，适用于不允许修改的STL，如set，一般建议采用这种写法
    val=1;//Compile Error
}
```

这在只需要读取且需要遍历整个容器时能节省许多字符，同时，对于`map`，范围`for`返回的是由下标和值组成的`pair`

同时，range based for支持用`auto`自动推导类型，如`for(const auto& v:vec)`，在类型名较长时好用

注意，范围`for`内不允许修改容器结构，修改容器结构（如insert,erase等）会导致迭代器失效，从而导致未定义行为

## 扔掉垃圾define

**请扔掉所有垃圾define**

真的，我见过太多炫技的`define`了

容我说句不好听的，多打几个字，一方面不会累死，一方面后期调试时脑内少一层翻译

我将在本节介绍替代`#define`的方法

### 常量型define

例子：
```cpp
#define MAXN 1e5
#define MAXM 1e4
//...
```

可以换为
```cpp
constexpr int MAXN=1e5;
constexpr int MAXM=1e4;
//...
```

### 类型名型define

例如：
```cpp
#define ll long long
```

可以换为
```cpp
using ll=long long;
```

### 装杯型define

以上两类define我都可以理解，但接下来这一类**我不能理解**

引用一段我的同学的代码（具体哪位就自己猜吧）

```cpp
#define Moonlight return
#define whispers 0
```

听我说，如果你的代码里有这类东西

**现在，立刻，马上把它们删掉**

`Moonlight`是大写开头还好，万一我有个变量名是`whispers`呢

你可能会说

> 啊我又不蠢不会用定义过的宏做变量名的

也许代码量在几十行内可以，如果是几百行呢？

或者……上千行呢？

你还能保证吗？

可读性呢？要知道有比赛是要和队友共享代码的

编译展开的错误信息呢？

### 可取的define

说了这么多，到底哪些`define`是可取的呢

当然有很多，例如
```cpp
#define pb push_back
#define mp make_pair
#define debug(x) cerr<<#x<<":"<<x<<endl
//...
```

如果你想直接判断一个宏到底可不可取，请对照下面的列表

- 约定俗成，如果这个宏已经成为约定俗成，加一分
- 名称有意义，如果你看到宏名可以立刻理解宏的作用，加一分
- 名称不易撞车，如果宏名不易与STL、甚至你自己定义的变量撞车，加一分
- 多次使用，如果这个宏在程序中使用多次，加一分
- 安全，如果宏函数无论传入什么参数都不会错误，加一分

> 关于安全的宏，这里举个例子
> 例如`#define sq(x) x*x`不安全，传入`2+3`展开后会变为`2+3*2+3`，结果是`11`而非`25`
> 但`#define sq(x) (x)*(x)`是相对安全的，传入`2+3`会变为`(2+3)*(2+3)`，结果符合预期的`25`
> 但即使这样也不建议传入有副作用的表达式，如`i++`

算好了吗？建议只用分数$\ge 3$的宏

比如`pb`宏的分数是1+0+1+1=3

因此`pb`是可取的

### 另一种方法……

如果你只在某个特定的函数内使用这个宏，可以在函数末尾加上`#undef XXX`

比如

```cpp
int main(){
    //十年OI一场空，不开_____见祖宗
    //所以
    #define int long long
    //...
    //do something
    //...
    return 0;
    #undef int
}
```

## std::iota()

有时，比如在并查集中，我们需要初始化一个递增的数组

但是写传统`for`循环字数太多了，~~很容易把我们累死~~

怎么办呢，这时就可以使用`std::iota`了

位于头文件`<numeric>`

### 用法

`std::iota()`的用法非常简单，可以这样：

```cpp
vector<int> vec(5);

iota(vec.begin(),vec.end(),0);//意为，从vec的开头开始，到vec的末尾结束
//从0开始递增填充
//vec <- 0,1,2,3,4

iota(vec.begin(),vec.end(),10)//vec <- 10,11,12,13,14

iota(vec.begin()+1,vec.end()-1,20)
//只填充中间部分，空出头尾
//vec <- REMAIN,20,21,22,REMAIN
```

这相比传统的循环少了好多字符，~~而且比用define省字符优雅多了不是吗~~

啊当然，这个也会溢出的，所以注意一下，~~我不说有多少人知道signed溢出是未定义行为的~~

### 一个彩蛋？

`std::iota`的名称来源于希腊字符`ι`和APL语言的`iota`函数

## std::sort()

相信`sort`大家也用过很多次了，这里不再赘述标准用法，而讨论一些进阶用法

位于头文件`<algorithm>`

### 倒序排列

`sort`的默认行为是升序排列，如果希望逆序排列，有以下方法

##### 使用greater<>

`greater<>`位于`<functional>`头文件中，专门用于表达可实例化的`operator>`，于是我们可以这样：

```cpp
vector<int> vec={5,2,6,3,1};

sort(vec.begin(),vec.end(),greater<int>());//注意要加圆括号
//因为加上圆括号才是临时对象，不加圆括号是类型名
//vec <- 6,5,3,2,1
```

##### 使用lambda

`lambda`函数是一种可以定义为变量的函数，因此可以直接写在`sort`的第三参内

```cpp
vector<int> vec={5,2,6,3,1};

sort(vec.begin(),vec.end(),
    [](int a,int b){
        return a>b;
    });//实际书写时不必缩进
//vec <- 6,5,3,2,1
```

传入`lambda`支持更加灵活的比较规则，实际上，任何返回`bool`表达式的`lambda`都可以作为比较规则

### 部分排序

有时，我们需要排序数组的一部分而不能更改其余部分

根据`vector`迭代器的特性，我们可以轻松做到这一点

```cpp
vector<int> vec={5,2,6,3,1};

sort(vec.begin(),vec.begin()+3,
    [](int a,int b){
        return a>b;
    });//只排序前三位
//vec <- 6,5,2,3,1
```

如果你在寻找“将前k小的元素排序，其它不做保证”，请索引至`std::partial_sort()`

## std::partial_sort

有时我们只需要取整个数组中前几小的元素，而直接`sort`时间复杂度太大

为解决这个问题，我们可以使用`partial_sort`

注意，`partial_sort`的第四参与`sort`的第三参相同，因此可以使用我们在`sort`一节讨论过的`trick`

例如
```cpp
vector<int> vec={8,3,5,7,1};

partial_sort(vec.begin(),vec.begin()+2,vec.end());
//找出从vec.begin()到vec.end()中，前2小的元素，并将它们排序至正确的位置
//vec <- 1,3,undef,undef,undef
//后三个元素不做保证
```

时间复杂度为$O(n \log k)$，在$k$为小常数时极快

## std::max_element,std::nth_element和std::min_element

这三个函数可以找出最大最小和第n小值

这三个函数的最后参与`sort`一致，因此也可以使用我们提到的`trick`

### minmax

这两位用法一样，放在一起讲

只要传入开始和结尾迭代器，就可以返回最大/最小值的迭代器

```cpp
vector<int> vec={1,2,3,4,5};

cout<<*max_element(vec.begin(),vec.end())<<endl;//5
cout<<*min_element(vec.begin(),vec.end())<<endl;//1
```

~~Simple!~~

### nth

这位严格讲和`partial_sort`是亲戚，用法类似

```cpp
vector<int> vec={7,5,3,8,1};

nth_element(vec.begin(),vec.begin()+2,vec.end());
//修改了vec
//vec <- undef,undef,5,undef,undef
//即把第（2+1）个元素放在正确的位置上
//注意，此时的偏移量就是下标了
```

所有这三个函数的效率都是$O(n)$，有时有奇效

## 结构化绑定

！注意，本篇为C++17特性！

当我们取`tuple`中的元素时，需要用`tie`和`get`写很多字，~~很容易把我们累死~~，这时就需要`结构化绑定`出场了

结构化绑定的用法是：

```cpp
tuple<int,int,char> tiic(1,2,'a');
//定义了一个tuple

auto [a,b,c]=tiic;//a==1 b==2 c=='a'
```

这样就可以一行内获取`tuple`的所有元素

### 与range based for结合

结合range based for可以做到舒适地遍历`vector<pair/tuple>`

如：

```cpp
vector<tuple<int,int,int>> vtiii={{1,2,3},{4,5,6},{7,8,9}};

for(const auto& [a,b,c]:vtiii){
    //a就是第一个元素
    cout<<a<<b<<c<<endl;
}
//运行结果：
//123
//456
//789
```

### 替代品

在C++14环境下，可以使用`std::tie`，只是需要自己定义好变量再绑定

## std::unordered_map

手写哈希太麻烦了，~~很容易把我们累死~~，这时使用`unordered_map`替代就很方便，只是要小心——如果出题人~~不讲伍德~~可能构造数据把`unordered_map`卡成$O(n)$查询，但一般情况不会，若时间宽裕可以考虑换为稳定$O(\log n)$的`map`

### empty() & size()

这两个无需多说，字面意思

`empty()`返回`unordered_map`是否为空，而`size()`返回实际键值对的数量

还可以用`max_size()`查看`unordered_map`最多容纳多少键值对

### operator[] & at()

依旧访问两兄弟，但这次稍有不同

`operator[]`：

- 速度较快
- 越界会自动插入一个零值而非报错
- 可能引起`rehash`导致效率暴跌
- 常用于插入值

`at()`：

- 速度稍慢 ~~（但慢不到哪里去）~~
- 越界会抛出异常，~~不catch就是RE~~
- 由于不做插入，效率稳定

但由于竞赛环境，这里的`at()`几乎无实际意义，`operator[]`插入零值的解决方法将在下文提到

### 查找(lookups)

这里，我们常用的一般只有`count()`

使用`count(key)`会返回键为`key`的元素数量，由于一一对应，这只能是`0`或`1`

搭配`count()`可以防止`operator[]`插入零值，如

```cpp
unordered_map<int,int> nxt={{1,2},{2,3},{3,4}};

if(nxt.count(1)){
    cout<<nxt[1]<<endl;
}//输出2

if(nxt.count(5)){//count(5)返回0，不执行
    cout<<nxt[5]<<endl;
}
//什么也不做
```

还可以用`find()`找到某个键的迭代器，但我们一般直接使用`operator[]`

### insert() & emplace()

插入元素，同样是拷贝和构造的区别

但我们一般也不常用，直接使用`operator[]`赋值就差不多了

非要用的话，可以使用`emplace(key,val)`在`key`键插入`val`，效率较高，尤其对于大对象，~~可能可以卡常？~~

### erase() & clear()

删除，`erase(key)`用于删除某个特定键对应的值，而`clear()`删除所有键值对，这与`vector`的`clear()`有同样的好处——后续的插入次数小于上次的容量时，将不再触发`rehash`，提升效率

### reserve()！

这个很少有人提到，但`unordered_map`也是可以`reserve()`的，与`vector`同理，它会预留足够的空间，避免昂贵的`rehash`，大幅度提升效率，能提升对毒瘤数据的抗性

### 自定义类型键

需要自行提供哈希函数，否则编译错误，常用的哈希有`异或位移哈希`，比如

```cpp
struct piiHash{
    size_t operator()(const pair<int,int>& pii){
        return ((long long)pii.first<<32)^pii.second;
    }
};
```
> 你可能会问，为什么要写这么复杂，难道我返回两个成员的和不行吗
> 因为我们不止要考虑“能不能用”，还要考虑“好不好用”
> 在这里，就是要考虑哈希碰撞
> 如果直接作和，(1,2)和(2,1)的哈希值相同
> 结果就是效率急剧下降

然后将`piiHash`作为第三模板参传入即可

```cpp
unordered_map<pair<int,int>,int,piiHash> mp;//OK
```

### map

`std::map`的用法与`unordered_map`相似，区别在于，`map`：

- 不需要传入哈希类（底层红黑树）
- 无需`reserve`（底层红黑树导致没必要）
- 效率稳定$O(\log n)$，怕卡（大数据）又不怕卡（毒瘤）

## std::string

这是STL的字符串存储类，极其常用

### 构造

`string`的构造与`vector`的构造几乎一致，唯一区别在于字符没有零值

##### string()

构造空串

##### string(count,ch)

构造长度为`count`，每个字符都是`ch`的串

##### string(iter,iter)

关于这种构造，与`vector`类似，详见[`vector`的双迭代器构造](#vectoriteriter)

### size() & empty()

字面意思，`empty()`返回是否为空串，`size()`返回字符串的字符数

### resize() & assign()

`resize(size,*ch*)`将字符串大小变为`size`，后面补`ch`，若`ch`未给定将补充`'\0'`

`assign()`重赋值，与构造函数用法相似

### operator[] & at()

这与`vector`相似，不同点在于返回字符

详见[`vector`的访问](#stdvectoroperator--stdvectorat)

### reserve()

同[`vector`的`reserve`](#stdvectorreserve)

### c_str()

返回`const char*`以供C-style函数使用，要注意的是，一定要保证`string`对象的生命周期，否则`c_str()`会垂悬

### 修改操作

##### operator+= & append()

这两个都可以在`string`末尾追加字符/字符串，但是要提醒一句，不要老是拿着字符串拼来拼去，复杂度是$O(l_2)$的，`operator+`更是$O(l_1+l_2)$的

##### push_back() & pop_back()

一个用于追加字符，一个用于删除末尾字符，好处在于这两个都是$O(1)$操作

##### insert() & erase()

`insert(pos,val)`可以在`pos`处插入`val`，`erase(pos,*len*)`则从`pos`开始删除`len`个字符，`len`未指定时删除`pos`后的所有字符

注意时间复杂度，与`vector`同理

### 查询操作

##### find() & rfind()

最常用的，用于查询子串的位置，一个从头开始，一个从尾开始，未找到会返回`string::npos`，也即`size_t(-1)`，或者更通俗的，`unsigned long long`的最大值

注意时间复杂度是$O(nm)$（或者$O(n)$，反正很慢就对了）

##### substr()

查询子串，`substr(pos,len)`从`pos`开始截取长为`len`的子串

##### find_first(last)_(not)_of()

这四个函数可有意思，有时有奇效

传入一个字符集（i.e.字符串），找到第一个（最后一个）（不）属于字符集的位置

例如：
```cpp
string str="hello, how are you?";

cout<<find_first_of("aeiou")<<endl;//查询第一个元音字母
//结果是1（e）

cout<<find_last_not_of("abcdefghijklmnopqrstuvwxyz")<<endl;
//查询最后一个非小写字母字符
//结果是18（?）
```

### 比较

`string`重载了所有比较运算，用于字典序比较，无需自己实现

这包括

```
operator<
operator>
operator==
operator!=
operator<=
operator>=
```

### iterators

同[`vector`迭代器](#iterators)

### 与其他类型的转换

我们经常需要从`int`等构造`string`，也经常需要从`string`构造其它类型

此时我们就可以使用内置函数

##### std::to_string()

将传入的参数变为`string`，如

```
1 -> "1"
42 -> "42"
5.78 -> "5.78"
```

##### std::stoi() & std::stod()

一个将`string`转为`int`，另一个转为`double`

```
stoi("12") -> 12

stod("4.5") -> 4.5
```

##### 关于string::npos

所有查询操作失败都会返回`string::npos`，请熟练运用`if(ret!=string::npos)`来判断

## std::set & std::multiset

弱化版平衡树，只能查询前驱后继特定值，甚至不能查排名和按排名查找……

~~说实话我想了半天没想起来我上次用是什么时候~~

不过还是有用的

位于头文件`<set>`/`<multiset>`

### iterators

begin()/end()返回首尾迭代器，rbegin()/rend()返回反向首尾迭代器，关于正反向迭代器详见[`vector`的迭代器](#iterators)

`set`的迭代器前后移动是$O(1)$的，也仅允许前后移动一位

### empty() & size()

字面意思，`empty()`返回是否为空，而`size()`返回元素数，`multiset`的`size()`包含重复项

### insert() & emplace()

插入元素用的两兄弟，一般建议使用`emplace()`省去拷贝

`insert(val)`和`emplace(val)`效果相同，都会插入`val`到`set/multiset`里

注意`set`会自动去重哦

### erase() & clear()

`erase(val)`用于删除值为`val`的元素，在`multiset`中会全部删除

`clear()`则用于清空，注意此时没有像`vector`那样的性能提升

### 查找操作

##### find(val)

查找值为`val`的元素，复杂度$O(\log n)$，返回迭代器，若找不到返回`end()`

##### count(val)

查询`val`在容器中出现的次数，复杂度$O(\log n)$，对于`set`，返回值$\in \{0,1\}$，对于`multiset`，结果可能大于$1$

##### lower_bound() & upper_bound()

二分查找，`lower_bound`返回第一个$\ge n$的元素，`upper_bound`返回第一个$ > n$的元素，复杂度$O(\log n)$，~~不就是后继吗（~~

### 替代

如果不要求有序，可以尝试`unordered_set`，其实更快一些，唯一的问题就是没法按顺序遍历了

## std::clamp

！这也是C++17特性！

黑科技+1！

这个函数很少有人用，但是用好它能杀死几乎所有越界访问

用法：

`std::clamp(val,lo,hi)`的行为为：

- $val \le lo$时，返回`lo`
- $lo \le val \le hi$时，返回`val`
- $hi \le val$时，返回`hi`

换句话说，它能把`val`定在$[lo,hi]$这个区间内

于是我们可以

```cpp
vector<int> vec={-1,1,2,3,4,5,-1};
int n;
cin>>n;//1-indexed输入，-1e9~1e9
cout<<vec[clamp(n,0,(int)vec.size()-1)]<<endl;
```

这样就不会越界了，可以通过在数组左右都加上一个`-1`来达成越界自动返回`-1`的效果

还有更多组合技，请读者自己研究（

## std::gcd和__gcd()

这两个都是求gcd的函数，区别在于`std::gcd()`在C++17引入，与之同时引入的还有`std::lcm()`，`__gcd()`则是GCC内置

~~虽然大部分时候考的是exgcd还是要自己写~~

这里就写这些，~~确实没什么好说的不是吗~~

## std::deque

啊，双端队列，既可以随机访问也可以首尾增删，`insert`和`erase`的复杂度还比`vector`少一半的常数（自动选择最近的一端移动）

~~性能还把queue完爆了，我们这里不是工程，不考虑接口安全~~

所以建议使用`queue`的场景其实也可以用`deque`替代，反而效率更高

~~当然你用`list`我也拦不住你是吧~~

位于头文件`<deque>`

### 构造

`std::deque`和[`std::vector`的构造方式](#构造函数)几乎一模一样，因为`std::deque`的迭代器也是随机访问迭代器，它可以和`vector`无缝衔接，使用互相的迭代器初始化效率极高

### size() & empty()

字面意思，`empty()`返回是否为空，`size()`返回元素数量

### operator[] & at()

也是随机访问的两小只，复杂度$O(1)$，但常数略大

不再写一次了，请移步[`vector`的operator\[\]&at()](#stdvectoroperator--stdvectorat)

### front() & back()

返回首/尾元素，复杂度$O(1)$

### push(pop)_back(front)()

首尾修改，复杂度$O(1)$，极其适用于滑动窗口的实现

举例：
```cpp
deque<int> dq={2,3,4};
dq.push_back(5);//2,3,4,5
dq.pop_front();//3,4,5
dq.push_front(1);//1,3,4,5
```

### emplace_back(front)()

原地构造函数，效率极高，建议使用本函数而非`push`

### insert() & erase()

同[`vector`的insert & erase](#stdvectorinserterase)，效率快一倍，但也仅仅是常数快一倍（

### clear()

清空`deque`，就这样

### resize()

多增少补的重设大小，零值填充，注意`deque`没有`reserve`，也无需`reserve`，因为`deque`不会像`vector`一样扩容

## 关于命名

优秀的命名习惯可以极大地提升调试时的心理舒适度，~~如果你是写代码一遍过的大佬请跳过本节~~

这里我将介绍几种常见的命名法

### 首先

首先，你要放弃变量名一定要短小的执念，短小的变量名和调试的舒适度不可兼得，~~除非你是脑内翻译如喝水的大佬，那当我没说~~

比如

```cpp
bool is_prime;//instead of 'flag'
int present_count;//instead of 'cnt'
string student_name;//instead of 'str'
```

### snake_case命名法

也称蛇形命名法，将变量名的成分用`_`隔开，例如

```cpp
bool is_prime;//是质数吗？
int present_count;//礼物的数量
string student_name;//学生名
```

### camelCase命名法

也称小驼峰，第一个单词小写，后面的单词第一个字母大写，例如

```cpp
bool isPrime;
int presentCount;
string studentName;
```

### PascalCase命名法

也称大驼峰，所有单词第一个字母大写，例如

```cpp
bool IsPrime;
int PresentCount;
string StudentName;
```

在选择命名法时，可以自行尝试适合自己的命名法，这可以大幅提高代码可读性

当然，也可以多种命名法混用

### 关于变量名的长度

当然也不能太长，谁也不想敲了个变量名就考试结束了对吧

笔者的建议是$2 \sim 3$词就足够了，如果含义特别明显，$1$词也可以

当然，`for`循环等循环体里该用`i`还是用`i`

## std::priority_queue

`priority_queue`是一个……很奇怪的容器，它不提供`clear`，也不提供迭代器等，核心操作极少，但是很有用

### empty() & size()

字面意思，`empty()`返回堆是否为空，`size()`返回堆的大小

### top()

返回堆顶元素

### push() & emplace()

向堆中推入元素，其中`emplace`是原地构造，效率较高

### pop()

弹出堆顶元素

### 创建时

由于堆接受三个模板参，第二个参是底层实现（填vector就行），最后一个参是比较规则，于是我们可以做小根堆：
```cpp
priority_queue<int,vector<int>,greater<int>> pq;
```

绝对值堆：
```cpp
template<typename T>
struct absCmp{
    bool operator()(T a,T b){
        return abs(a)<abs(b);
    }
};

priority_queue<int,vector<int>,absCmp<int>> pq;
```

模长堆：
```cpp
template<typename T>
struct lenCmp{
    bool operator()(pair<T,T> a,pair<T,T> b){
        return sqrt(pow(a.first,2)+pow(a.second,2))<
                sqrt(pow(b.first,2)+pow(b.second,2));
    }
};

priority_queue<pair<int,int>,vector<pair<int,int>>,lenCmp<int>> pq;
```

等等奇奇怪怪的堆

## std::chrono

我们在卡常时经常需要估测自己的代码速度如何，然而Dev-cpp的运行会把你输入的时间也算进去！此时我们可以使用`std::chrono`计时

### 控制区间

`chrono`通常测量某个区间的时间消耗，如果你想测量时间，首先你需要锚定两个时间点，如：

```cpp
auto begin=std::chrono::steady_clock::now();//锚定开始点
//...
//假装这里有一堆耗时的函数
//...
auto end=std::chrono::steady_clock::now();//锚定结束点
```

这样，我们就得到了两个可用的时间点

### 测量时长

有了两个时间点，我们就可以测量它们之间的距离

```cpp
auto elapsed=std::duration_cast<std::milliseconds>(end-begin);
```

然后输出

```cpp
cout<<elapsed.count()<<endl;//这样，输出为一个整数
```

### 小彩蛋？

其实`chrono`的名字词源来自希腊语中的“时间”，而且是特指的“可测量的时间”而非“混沌的时间”

## lambda

有时，我们会遇到一些体积小的函数，这时写在全局会觉得有些小题大做，而且翻看修改函数体需要跨越整个主函数，这非常麻烦，此时我们就可以使用`lambda`

### 一般lambda

一般的`lambda`结构形如

```cpp
auto lambda=[](/*params...*/){/*do something*/};
```

比如，定义两个int之间的绝对值比较：

```cpp
auto absCmp=[](int a,int b){return abs(a)<abs(b);};
```

这种`lambda`不涉及外部变量，只和参数有关

### 捕获列表

有时，我们希望`lambda`可以使用除参数外的变量，此时我们需要捕获

一般来说，我们不一个一个地捕获，而是直接使用下面的两种之一：

`[=](){}`：值捕获，顾名思义，它捕获的是值，也就是“外部变量的当前快照”

`[&](){}`：引用捕获，顾名思义，它捕获引用，也就是“外部变量的别名”

这两个的区别，就像函数形参与实参的区别

由于我们在时间资源宝贵的竞赛环境，我们一般不使用值捕获昂贵的拷贝，多使用引用捕获

比如：

```cpp
vector<vector<int>> adj;
//假装这里建了图

auto dfs=[&](int u,int from){
    //do something.
    for(const auto& v:adj[u]){
        if(v==from) continue;
        //do something.
    }//不会报错，引用捕获了adj
    //do something.
}
```

### 自动lambda

是的，这玩意也能自动

自C++14起，`lambda`的参数可以是`auto`推导，~~但这种情况下我情愿写模板~~

比如：

```cpp
auto add=[](auto a,auto b){
    return a+b;
};
```

这样传什么参都可以，只要你确保`operator+`不报错就行

## 通用二分查找

有时我们需要快速查找某个元素，此时STL中的`upper/lower_bound`和`binary_search`就可以用了

### upper/lower_bound

两函数传参相同，区别在于`upper`返回严格大于，`lower`返回大于等于

传入两个迭代器和需要查找的值即可从区间内进行二分查找

```cpp
vector<int> vec={1,4,5,7,8,9,11};
cout<<*lower_bound(vec.begin(),vec.end(),5)<<endl;//5
cout<<*upper_bound(vec.begin(),vec.end(),5)<<endl;//7
```

若找不到，返回`end()`

同时，这两个函数允许传第四参定义比较规则，详见[sort](#stdsort)和[priority_queue](#stdpriority_queue)，但要注意，容器中元素的顺序要与之自洽

### binary_search

如果你只关心容器中是否存在值，可以用`binary_search`，传参与上述两函数相同，并返回`bool`类型表示是否存在

但其实，`if(lower_bound!=end())`也行……

## std::accumulate

有时我们要获取整个容器内所有元素的累加，累乘……但传统方式的循环 ~~很容易把我们累死~~ ，因此我们引入`std::accumulate`

在`<numeric>`库中

### 基本用法

基本用法是`accumulate(begin,end,init)`，意为初始值为`init`，从`begin`到`end`对`init`累加

举个例子

```cpp
vector<int> vec(100);
iota(vec.begin(),vec.end(),1);//还记得它吗，可以去看iota一节的内容
cout<<accumulate(vec.begin(),vec.end(),0)<<endl;
//等同于从1加到100
//输出5050
```

请记住，返回值取决于初始值类型，也就是说，如果你想防溢出，请把`init`写成`0ll`而非`0`，如果你想累加浮点数，请使用`0.0`而非`0`

### 进阶用法

当然不可能只能累加的，如果只能累加那这个函数拉完了（

这个函数还有第四参，表示对`init`进行的操作，比如：

```cpp
accumulate(vec.begin(),vec.end(),1,[](int a,int b){return a*b;});
//等同于从1乘到100，也即fact(100)
//效率O(n)
```

再比如：

```cpp
accumulate(vec.begin(),vec.end(),string(),[](string a,int b){
    return a+to_string(b);
})
//字符串化的加法
//结果是"1234567891011121314151617181920212223..."
```

## std::partial_sum & std::adjacent_difference

还是`<numeric>`里的，~~numeric里好多偷懒用的东西~~

用来计算前缀和和差分，又能省去一个循环

### 基本用法

`partial_sum(inputBegin,inputEnd,outputBegin)`即可把迭代器从`inputBegin`到`inputEnd`做前缀和后的结果存储到从`outputBegin`开头的容器中，`adjacent_difference`同理

### 进阶用法

这两个函数同样有第四参，表示操作类型，默认分别为`operator+`和`operator-`，例子可见[accumulate的相关部分](#进阶用法)

## std::bitset

高配版`array<bool>`，构造灵活，支持位运算

头文件`<bitset>`

### 构造

##### 空构造

构造全是`0`的X位`bitset`

##### 数字构造

通过一个整数的二进制表达构造`bitset`

##### 字符串构造

可以通过0-1串构造，如

```cpp
bitset<8> bs("00010101");//00010101
```

也可以自定义规则构造，如

```cpp
bitset<8> bs("ABABBBBB"/*字符串*/,8/*字符串长度*/,'A'/*0*/,'B'/*1*/)
//01011111
```

### operator[] & test()

访问某位，`operator[]`不进行边界检查，`test()`进行边界检查并抛出异常，~~老板你这RE多少钱一斤啊~~

### all() & any() & none()

- `all()`返回是否所有位都是`1`
- `any()`返回是否有任意位是`1`
- `none()`返回是否所有位都是`0`

### count()

返回`1`的数量，等同于`popcount()`

### set() & reset() & flip()

`set(pos)`可以将`pos`位设为`1`，或传入`(pos,val)`设置特定值，不传参则将所有位设为`1`

`reset(pos)`可以将`pos`位设为`0`，或不传参重置整个`bitset`

`flip(pos)`将`pos`位翻转，不传参则整体翻转

### 转换方法

`to_string()`将`bitset`转为字符串表达

`to_ulong()`和`to_ullong()`则转为`unsigned long (long)`

### 位运算

支持所有位运算运算符，这包括`&`、`|`、`~`、`^`、`<<`、`>>`以及对应的赋值复合运算符

同时`bitset`支持`==`和`!=`比较

注意`bitset`不支持位运算之外的算术运算符

## std::array

其实这就是个静态数组，比如

```cpp
array<int,8> arr={1,2,3,4,5,6,7,8};

cout<<arr[1]<<endl;//2

cin>>arr[2]>>endl;//更改下标为2的位
```

用法很简单，本节将主要围绕“为什么”展开

~~不要再骂array没用了，它明明在嵌入式暴打vector的QAQ~~

### 栈上分配

是的，它在栈上分配

缺点是容易MLE，因为……栈上分配嘛

但这导致了它极快的访问速度，可以极限卡常

### STL同步

它也有STL的迭代器等现代特性，可以获取迭代器，也可以搭配算法库

有`size()`等方法，支持拷贝赋值（C数组不行）

### 传参不退化

想象你需要给函数传一个数组作为参数，你在参数栏写了`int a[]`，结果它退化成`int* a`了……但是`array`不会退化

但要注意的是，`array`直接传参会深拷贝，正确姿势是加上`const &`或者（视情况）加上`&`

### 方便转化

如果你真的想用C-style数组了（可能某个老旧库要求传入？），也可以用`.data()`方法转化成老函数支持的形式

但和`string`同理，[注意垂悬指针](#c_str)

## 卡常技巧

### 1.基本I/O加速

```cpp
ios::sync_with_stdio(false);
cin.tie(0),cout.tie(0);
```

解除`cin/cout`与C标准输入输出的绑定加速，虽然老生常谈了，但是

**不要在这之后混用C输入输出和iostream**

还有，用`\n`替换`endl`可以加速，但在调试阶段建议至少在最后调用`cout.flush()`刷新缓冲区，不然可能有点麻烦

### 2.reserve()

像`vector`、`unordered_map`这些，能`reserve`可以先预分配以下，能取消昂贵的$O(n)$扩张

### 3.多用STL

乍一听很反直觉，但是你要相信，你几年的功底是比不上写STL的那帮人的

有时，但只是有时，STL出于异常安全等因素可能稍慢

### 4.将乘除换为位运算

也许能省几个时钟周期？

### 5.std::move移动构造

当你将一个容器的数据移动到另一个容器内时，不要忘了用`std::move`加速

当然要注意的是，`move`后原容器处于有效但未指定状态，**不要再尝试从原容器内取元素**

### 6.调整循环结构，换用switch

去掉不必要的`continue`和`break`、更改语句顺序减少`continue`和`break`……

换成`switch-case`……

可以加大CPU分支预测成功率，效率提升

### 7.用array替代vector

栈分配比堆分配快得多，但是注意栈内存很小，`array`是实打实的$n \times \text{sizeof}(T)$的开销

### 8.把const常量换成constexpr常量

也许能快几纳秒？

## std::stack

位于头文件`<stack>`

栈的`LIFO`特点相信大家都知道了，合法括号串大家应该也都做过了（~~没做过的快去做一次~~）

这一节主要讲一些可能没人用的用法

~~但其实好像`vector`都能做？~~

### 非递归DFS

都说`queue`对应`BFS`，`stack`对应`DFS`，但是实战中好像没几个人用`stack`的？

只要把BFS模板的`queue`换成`stack`就行了

```cpp
struct state{/*假装这是状态结构*/};

stack<state> st;
st.emplace(originState);//注意emplace（
while(!st.empty()){
    state now=st.top();
    st.pop()

    doSomething(state);

    st.emplace(nextState);
}
```

### 容器加速

stack可以传两个模板参，第二个决定底层容器，默认是`deque`

但是`vector`内存连续，性能更好，于是我们可以

```cpp
stack<int,vector<int>> vecSt;
```

这样会稍微快一点（也许是卡常），但是均摊`push`会慢一些

Well actually，用`stack`的场景建议用`vector`实现，都能末尾删改`vector`还能遍历（

或者觉得`vector`重分配多的话可以用`deque`

## 通用迭代器操作

其实迭代器就是现代化的指针，所以它有很多指针的操作

### opeartors

```
operator++
operator*
operator->
```

这三个运算符几乎所有迭代器都支持，`operator++`用来把迭代器向后移位，`operator*`用来解引用，直接获取数据，`operator->`则是把迭代器当指针用访问成员，比如`it->member`是合法的

### 比较

迭代器之间可以使用`operator==/operator!=`判断是否指向同一位置

### iterator头文件

提供一系列辅助函数

`advance(it,n)`，让`it`前进`n`步，效率取决于迭代器类型

`distance(it1,it2)`，计算两迭代器之间的距离，~~你不会传两个不同容器的迭代器进去的，对吧？~~

`prev(it,n=1)/next(it,n=1)`，返回迭代器后退/前进`n`步后的迭代器，不修改原迭代器

## std::random

更稳定的随机库，~~一般用来写游戏玩~~

位于头文件`<random>`

### 初始化

要使用`std::random`，首先需要初始化随机设备

```cpp
std::random_device rd;//随机设备
std::mt19937 gen(rd());//初始化mt19937引擎
//别跟我说名字难背，你2147483647都能背下来了19937背不下来啊（
```

### 定义分布

STL提供了许多分布，我们一般使用均匀分布

```cpp
std::uniform_int_distribution<> disI(1,6);//1~6的均匀整数
std::uniform_real_distribution<> disR(0.0,1.0);//0~1的均匀实数
```

### 使用

最后，直接调用`dis(gen)`就可以获取一个随机数了

## 重载输入输出流

有时，我们有自定义的结构体或大量的STL要输出/输入，此时再遍历内部结构就又要敲一重循环，~~很容易把我们累死~~，此时可以重载输入输出流

### 输出行为

`iostream`提供了重载`operator<<`的方法：

```cpp
ostream& operator<<(ostream& out,pair<int,int>& pii){//以pair<int,int>为例
    out<<pii.first<<","<<pii.second;
    return out;
}
```

这样的效果就是

```cpp
pair<int,int> pii(1,2);
cout<<pii<<endl;
//结果：
//1,2
//
```

> 小知识
> 你知道为什么要返回ostream&吗
> 这称为链式调用
> 由于`operator<<`返回了`out`，也即例子中的`cout`
> 运算过程就变成了
> `cout<<pii<<endl`
> `cout<<endl`，因为`cout<<pii`的运算返回值是`cout`
> `cout`
> 结束，这保证了输出流可以无限接数据

### 输入行为

与输出行为相似：

```cpp
istream& operator>>(istream& in,pair<int,int>& pii){
    in>>pii.first>>pii.second;
    return in;
}
```

效果类似，读入两个数后返回一个`pair<int,int>`

同样是链式调用

## assert与更多debug

### assert

`assert`位于`<cassert>`头文件中，作用简洁：在`bool`表达式返回`false`时，终止程序并弹出自己

听起来很难懂？没关系，这里有个例子

```cpp
int getVal(size_t idx,vector<int>& vec){
    assert(idx<=vec.size()-1);//确保不越界
    return vec[idx];
}

getVal(3,{1,2,3,4,5})//4
getVal(100,{1,2,3})//！触发assert
```

`assert`触发以后，会打印一条类似的消息：

```
Assertion failed: idx<=vec.size()-1, file xxx.cpp, line xxx
```

很清晰，对吧？还会打印行数，能精准定位

只是这玩意会触发`abort()`，如果你需要释放资源可能需要注意一下 ~~（不过我们打竞赛的有什么资源可以释放啊）~~

如果需要去掉，不必一个一个删，可以直接`#define NDEBUG`，自动无视所有`assert`

### \_\_LINE\_\_ \_\_FILE\_\_ & \_\_FUNCTION\_\_

信息三大标准宏

顾名思义，`__LINE__`宏会被展开为当前行，`__FILE__`宏会被展开为当前文件，`__FUNCTION__`宏会被展开为当前函数

于是我们可以：

```cpp
#ifdef DEBUG
#define LOG(msg) cerr<<"line:"<<__LINE__<<"func:"<<__FUNCTION__\
                     <<"msg:"<<msg<<endl
#else
#define LOG(msg) (void)0
#endif
```

这样就可以做到零开销日志了，哦对了，别忘了调试结束的时候删掉`#define DEBUG`

---

## 附录：二分决策树选择最合适的容器

- 需要/不需要随机访问？
- 需要
- - 插入方式是尾部还是两端，或是随机？
- - 尾部
- - - 需要清晰的接口？
- - - 需要
- - - - `std::stack`
- - - 不需要
- - - - `std::vector`
- - 两端
- - - `std::deque`
- - 随机
- - - 保证数据有序？
- - - 保证
- - - - `std::map`（你别管是不是$O(1)$，你就说随没随机吧）
- - - 不保证
- - - - `std::unordered_map`
- 不需要
- - 插入方式是随机插入还是`LIFO`？
- - 随机
- - - 插入时保证数据有序还是保持原顺序？
- - - 有序
- - - - `std::set`
- - - 原顺序
- - - - `std::list`
- - `LIFO`
- - - 需要何种特殊行为？
- - - 无
- - - - `std::queue`
- - - 取最值
- - - - `std::priority_queue`

~~吓哭了这里还有初中生物~~

---

## 附录：常见的~~升压~~错误及原因

|场景\\错误类型|WA|RE|TLE|MLE|
|:-:|:-:|:-:|:-:|:-:|
|图论题中，你确定你的思路无误|注意`0-1indexed`|同`WA`|`BFS`忘记加`vis`|`BFS`忘记`pop()`/数组开大了|
|数据结构题中，你确定你的选择正确|同上|同上/越界访问/`NULL`指针解引用/无尽递归|`N/A`|数组开大了|
|一道确定为模拟的题|边界条件处理，可以利用`assert`|当心数组越界|`N/A`|`N/A`|
|搜索题|当心`0-1indexed`|数组越界/递归过深|搜索忘记加`vis`|搜索忘记`pop()`|
|数学题|`N/A`|想清自己数组的定义到底是0还是1-indexed|`N/A`|`N/A`|
|二分答案|到底`r=mid`还是`mid+1`，`l=mid`还是`mid-1`？|数组越界|`while`条件写错导致死循环|`N/A`|