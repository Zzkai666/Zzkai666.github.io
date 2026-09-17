---
title: "C++面向对象笔记"
date: 2023-07-21
tags: ["C++", "面向对象"]
categories: ["编程笔记"]
summary: "C++ 面向对象核心概念：内存四区模型（代码区、全局区、栈区、堆区）以及分区带来的生命周期意义。"
---
## 内存分区模型
   C++程序在执行时，将内存大致划分为**四个区域**
- 代码区：存放函数体的二进制代码，由操作系统进行管理的
- 全局区：存放全局变量和静态变量以及常量
- 栈区：由编译器自动分配释放, 存放函数的参数值,局部变量等
- 堆区：由程序员分配和释放,若程序员不释放,程序结束时由操作系统回收
内存四区的意义：
不同区域存放的数据，赋予不同的生命周期, 给我们更大的灵活编程
### 程序运行前
   在程序编译后，生成了exe可执行程序，**未执行该程序前**分为两个区域
**代码区：**

​ 存放 CPU 执行的机器指令

​ 代码区是**共享**的，共享的目的是对于频繁被执行的程序，只需要在内存中有一份代码即可

​ 代码区是**只读**的，使其只读的原因是防止程序意外地修改了它的指令

​ **全局区：**

​ 全局变量和静态变量存放在此.

​ 全局区还包含了常量区, 字符串常量和其他常量也存放在此.

​ 该区域的数据在程序结束后由操作系统释放.
**示例：**
```cpp
//全局变量  
int g_a = 10;  
int g_b = 10;  
//全局常量  
const int c_g_a = 10;  
const int c_g_b = 10;  
int main() {  
  
	//局部变量  
	int a = 10;  
	int b = 10;  
	//打印地址  
	cout << "局部变量a地址为： " << (int)&a << endl;  
	cout << "局部变量b地址为： " << (int)&b << endl;  
  
	cout << "全局变量g_a地址为： " <<  (int)&g_a << endl;  
	cout << "全局变量g_b地址为： " <<  (int)&g_b << endl;  
  
	//静态变量  
	static int s_a = 10;  
	static int s_b = 10;  
  
	cout << "静态变量s_a地址为： " << (int)&s_a << endl;  
	cout << "静态变量s_b地址为： " << (int)&s_b << endl;  
  
	cout << "字符串常量地址为： " << (int)&"hello world" << endl;  
	cout << "字符串常量地址为： " << (int)&"hello world1" << endl;  
  
	cout << "全局常量c_g_a地址为： " << (int)&c_g_a << endl;  
	cout << "全局常量c_g_b地址为： " << (int)&c_g_b << endl;  
  
	const int c_l_a = 10;  
	const int c_l_b = 10;  
	cout << "局部常量c_l_a地址为： " << (int)&c_l_a << endl;  
	cout << "局部常量c_l_b地址为： " << (int)&c_l_b << endl;  
  
	system("pause");  
  
	return 0;  
}
```

## 引用
### 引用作函数参数
```cpp

//1. 值传递
void mySwap01(int a, int b) //实质上是将创建的两个局部变量的数进行了交换，函数运行结束后就被释放了。
{
	int temp = a;
	a = b;
	b = temp;
}
//2. 地址传递
void mySwap02(int* a, int* b) //通过地址传递的，获取了a,b的地址，从地址层面交换数值
{
	int temp = *a;
	*a = *b;
	*b = temp;
//3. 引用传递
void mySwap03(int &a,int &b) //创建了引用，此处的a是main里a的别名，同理，b也是。
{							 //跟mySwap01不一样的是，该函数直接操控位于那个内存的值（main函数里的a，b），没有另外创建局部变量。
	int temp = a;
	a = b;
	b = temp;
}
int main()
{
	int a=10;
	int b=20;
	mySwap01(a,b);//无法将a,b的值进行交换

	mySwap02(&a,&b);//可以交换

	mySwap03(a,b);//可以交换

	cout<<"a = "<< a << endl;
	cout<<"b = "<< b << endl;
}
```
### 引用的本质
引用在本质上就是一个指针**常量**
```cpp
//发现是引用，转换为 int* const ref = &a;
void func(int& ref){
	ref = 100; // ref是引用，转换为*ref = 100
}
int main(){
	int a = 10;
    
    //自动转换为 int* const ref = &a; 指针常量是指针指向不可改，也说明为什么引用不可更改
	int& ref = a; 
	ref = 20; //内部发现ref是引用，自动帮我们转换为: *ref = 20;
    
	cout << "a:" << a << endl;
	cout << "ref:" << ref << endl;
    
	func(a);
	return 0;
}
```
## 类和对象
### 对象的初始化和清理
- 生活中我们买的电子产品都基本会有出厂设置，在某一天我们不用时候也会删除一些自己信息数据保证安全
- C++中的面向对象来源于生活，每个对象也都会有初始设置以及 对象销毁前的清理数据的设置。
### 构造函数和析构函数
对象的**初始化和清理**也是两个非常重要的安全问题

​ 一个对象或者变量没有初始状态，对其使用后果是未知

​ 同样的使用完一个对象或变量，没有及时清理，也会造成一定的安全问题

c++利用了**构造函数**和**析构函数**解决上述问题，这两个函数将会被编译器**自动调用**，完成对象初始化和清理工作。

对象的初始化和清理工作是编译器强制要我们做的事情，因此如果我们不提供构造和析构，编译器会提供

编译器提供的构造函数和析构函数是**空实现**。

- 构造函数：主要作用在于创建对象时为对象的成员属性赋值，构造函数由编译器自动调用，无须手动调用。
- 析构函数：主要作用在于对象销毁前系统自动调用，执行一些清理工作。
**构造函数语法：**```类名(){}```
1. 构造函数，没有返回值也不写void
2. 函数名称与类名相同
3. 构造函数可以有参数，因此可以发生重载
4. 程序在调用对象时候会自动调用构造，**无须手动调用**,而且只会调用一次
5. 调用默认构造函数时，不要加（），因为编译器会认为这是一个函数声明，不会认为在创建对象
6. Person(10);创建匿名对象-->当该行执行结束后，系统会立即回收掉匿名对象(调用析构函数)
7. 不要利用拷贝构造函数初始化匿名对象，编译器会认为 Person (p3) ==Person p3;是p3的对象声明
**析构函数语法：** `~类名(){}`

1. 析构函数，没有返回值也不写void
2. 函数名称与类名相同,在名称前加上符号 ~
3. 析构函数**不可以有参数**，因此不可以发生重载
4. 程序在对象销毁前会自动调用析构，**无须手动调用**,而且只会调用一次
```cpp
class Person
{
public:
	//构造函数
	Person()
	{
		cout << "Person的构造函数调用" << endl;
	}
	//析构函数
	~Person()
	{
		cout << "Person的析构函数调用" << endl;
	}

};

void test01()
{
	Person p;
}

int main() {
	
	test01();

	system("pause");

	return 0;
}
```
### 小笔记
对一个对象进行的new和delete必须在同一个作用域(大括号)内进行，否则会发生**内存泄露(memory leak)**。
```cpp
class complex {······};
·······
{
	complex* p=new complex(1,2);
	···
	delete p;
}
```

如果delete p在大括号外，就会发生内存泄露。因为当作用域结束，p所指向的位于堆区（heap）的对象仍然存在，但是指针p的生命结束了，作用域外再也看不到这个p，也就无法进行delete p了。

C++的new type方法内部使用的是malloc(sizeof(type)),delete方法内部调用free。

array new必须搭配array delete，否则，编译器不知道要释放的内存的大小，导致只调用一次析构函数。

动态分配的内存块，debug模式分配的比release模式多。

默认情况下，c++编译器至少给一个类添加3个函数

1. 默认构造函数(无参，函数体为空)
2. 默认析构函数(无参，函数体为空)
3. 默认拷贝构造函数，对属性进行值拷贝

构造函数调用规则如下：

- 如果用户定义有参构造函数，c++不在提供默认无参构造，但是会提供默认拷贝构造
- 如果用户定义拷贝构造函数，c++不会再提供其他构造函数
### 构造函数的分类
```cpp
//1、构造函数分类
// 按照参数分类分为 有参和无参构造   无参又称为默认构造函数
// 按照类型分类分为 普通构造和拷贝构造

class Person {
public:
	//无参（默认）构造函数
	Person() {
		cout << "无参构造函数!" << endl;
	}
	//有参构造函数
	Person(int a) {
		age = a;
		cout << "有参构造函数!" << endl;
	}
	//拷贝构造函数
	Person(const Person& p) {
		age = p.age;
		cout << "拷贝构造函数!" << endl;
	}
	//析构函数
	~Person() {
		cout << "析构函数!" << endl;
	}
public:
	int age;
};

//2、构造函数的调用
//调用无参构造函数
void test01() {
	Person p; //调用无参构造函数
}

//调用有参的构造函数
void test02() {

	//2.1  括号法，常用
	Person p1(10);
	//注意1：调用无参构造函数不能加括号，如果加了编译器认为这是一个函数声明
	//Person p2();

	//2.2 显式法
	Person p2 = Person(10); 
	Person p3 = Person(p2);
	//Person(10)单独写就是匿名对象  当前行结束之后，马上析构

	//2.3 隐式转换法
	Person p4 = 10; // Person p4 = Person(10); 
	Person p5 = p4; // Person p5 = Person(p4); 

	//注意2：不能利用 拷贝构造函数 初始化匿名对象 编译器认为是对象声明
	//Person p5(p4);
}

int main() {

	test01();
	//test02();

	system("pause");

	return 0;
}
```

### 深拷贝与浅拷贝
浅拷贝：简单的赋值拷贝操作(编译器默认的拷贝构造函数是进行的浅拷贝，会导致堆区数据出现问题)

深拷贝：在堆区重新申请空间，进行拷贝操作(深拷贝需要自己对拷贝构造函数进行编写)

**浅拷贝**：Person p2(p1);将p1的int等类型的值进行复制（没什么问题），对p1中的指针指向的地址也进行了复制，导致p2与p1的指针m_Height指向堆区同一个地址，会在最后调用析构函数（在析构函数中添加代码，对类中申请的堆区进行释放）时，对该堆区地址重复释放。
```cpp
class Person {
public:
	//无参（默认）构造函数
	Person() {
		cout << "无参构造函数!" << endl;
	}
	//有参构造函数
	Person(int age ,int height) {
		
		cout << "有参构造函数!" << endl;

		m_age = age;
		m_height = new int(height);
		
	}
	//拷贝构造函数  
	Person(const Person& p) {
		cout << "拷贝构造函数!" << endl;
		//如果不利用深拷贝在堆区创建新内存，会导致浅拷贝带来的重复释放堆区问题
		m_age = p.m_age;
		m_height = new int(*p.m_height);
		
	}

	//析构函数
	~Person() {
		cout << "析构函数!" << endl;
		if (m_height != NULL)
		{
			delete m_height;
		}
	}
public:
	int m_age;
	int* m_height;
};

void test01()
{
	Person p1(18, 180);

	Person p2(p1);

	cout << "p1的年龄： " << p1.m_age << " 身高： " << *p1.m_height << endl;

	cout << "p2的年龄： " << p2.m_age << " 身高： " << *p2.m_height << endl;
}

int main() {

	test01();

	system("pause");

	return 0;
}
```
**总结**：如果属性有在堆区开辟的，一定要自己提供拷贝构造函数，防止浅拷贝带来的问题
### 初始化列表(大师风范--好习惯)
语法：构造函数()：属性1(值1),属性2（值2）... {}
```cpp
class Person {
public:

	////传统方式初始化
	//Person(int a, int b, int c) {
	//	m_A = a;
	//	m_B = b;
	//	m_C = c;
	//}

	//初始化列表方式初始化
	Person(int a, int b, int c) :m_A(a), m_B(b), m_C(c) {}
	void PrintPerson() {
		cout << "mA:" << m_A << endl;
		cout << "mB:" << m_B << endl;
		cout << "mC:" << m_C << endl;
	}
private:
	int m_A;
	int m_B;
	int m_C;
};

int main() {

	Person p(1, 2, 3);
	p.PrintPerson();


	system("pause");

	return 0;
}
```
