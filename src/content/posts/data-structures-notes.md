---
title: "数据结构笔记"
date: 2023-09-03
tags: ["数据结构"]
categories: ["编程笔记"]
summary: "数据结构基础概念梳理：数据、数据元素、数据项与数据对象的区别，以及逻辑结构与存储结构两个层次。"
---
## 几种容易混淆的数据类概念
- **数据**：是能输入计算机且能被计算机处理的各种符号的**集合**；是信息的载体；是对客观失误符号化的表示；能够被计算机识别、存储和加工。包括**数值型的数据**（整数、实数等）和**非数值型的数据**（文字、图像、声音等）。
- **数据元素**：是数据的**基本单位**，在计算机程序种通常作为一个整体进行考虑和处理。也简称为元素，或称为记录、节点或顶点。
- **数据项**：构成数据元素的不可分割的**最小单位**。
- **数据对象**：是性质相同的**数据元素**的**集合**，是**数据**的一个子集。例如，**整数**的数据对象是集合N={0，+-1，+-2，···}；**字母字符**的数据对象是集合C={'A','B','C',···}；**学籍表**也可看作一个数据对象（若干条学生记录构成的子集）。
## 数据结构的两个层次
### 逻辑结构
- 描述数据元素之间的逻辑关系
- 与数据的存储无关，独立于计算机
- 是从具体问题抽象出来的数学模型
### 物理结构（存储结构）
- 数据元素及其关系在计算机存储器种的结构（存储方式）
- 是数据结构在计算机种的表示
### 逻辑结构与存储结构的关系
- 存储结构是逻辑关系的映像与元素本身的映像。
- 逻辑结构是数据结构的抽象，存储结构是数据结构的实现。
- 两者综合起来建立了数据元素之间的结构关系。


## 链表
定义一个不带头结点的单链表
```cpp
typedef struct Lnode{					//定义单链表节点类型
	ElemType data;						//每个结点存放一个数据元素
	struct Lnode* next;					//指针指向下一个节点
}Lnode,* LinkList;

//强调这是一个链表，用LinkList;
//强调这是一个结点，用Lnode* ;

//初始化一个空的链表
bool InitList(LinkList &L)
{
	L=NULL;  //空表，暂时还没有节点
	return true;
}
void test01()
{
	LinkList L;						//声明一个指向单链表的指针
	InitList(L);					//初始化一个空表
}
//判断单链表是否为空(无头结点)
bool Empty(LinkList L)
{
	if(L=NULL)
		return true;
	else
		return false;
}

```
定义一个带有头结点的单链表
```cpp
typedef struct Lnode{					//定义单链表节点类型
	ElemType data;						//每个节点存放一个数据元素
	struct Lnode* next;					//指针指向下一个节点
}Lnode,* LinkList;

//强调这是一个链表，用LinkList;
//强调这是一个结点，用Lnode* ;
bool InitList(LinkList &L)
{
	L=(Lnode *)malloc(sizeof(Lnode));	//分配一个头结点
	if(L=NULL)							//内存不足，分配失败
		return false;
	L->next=NULL;
	return true;
}

void test()
{
	LinkList& L;						//声明一个指向单链表的指针
	InitList(L);						//初始化一个空表
}
//判断单链表是否为空（带头结点）
bool Empty(LinkList L)
{
	if(L->next==NULL)
		return true;
	else
		return false;
}
```
按位序插入（带头结点）
```cpp
//在第i个位置插入元素e（带头结点）
bool ListInsert(LinkList& L,int i,ElemType e)
{
	if(i<1) return false;				
	Lnode* p;							//指针P指向当前扫描的结点
	p=L;								//L指向头结点，头结点是第0个结点（不存数据）
	int j=0;							//当前P指向的第几个结点
	while(p!=NULL && j<i-1)		//循环找到第i-1个结点
	{
		p=p->next;
		j++;
	}
	if(p==NULL) return false;			//i值不合法
	//如果链表有长度记录的话,i必须满足i<=L.length+1（length不包含头结点）
	Lnode* s;
	s=(Lnode* )malloc(sizeof(Lnode));
	s->data=e;
	s->next=p->next;						//不可以与下一个操作交换顺序
	p->next=s;								//将结点S连到P之后

}
```
