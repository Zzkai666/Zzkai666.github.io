---
title: "C++小知识"
date: 2024-07-20
tags: ["C++"]
categories: ["编程笔记"]
summary: "头文件保护宏的两种等价写法：#ifndef / #define / #endif 与 #pragma once，以及 #include 的实质。"
---
### 头文件创建时两种方式需要注意：
```cpp
#ifndef _LOG_H
#define _LOG_H


#endif
```
或者
```cpp
#pragma once
```
这两种方式等价，都是为了避免头文件内容被单个Cpp文件多次使用。

```cpp
#include<>命令实质上是将头文件里的内容复制粘贴过来
```
