---
title: "图形化编程"
date: 2024-01-25
tags: ["C/C++", "EasyX"]
categories: ["编程笔记"]
summary: "用 EasyX 图形库做 C/C++ 图形化编程：窗口创建、颜色、文字绘制、图片加载与背景音乐播放的完整示例。"
---
# Easyx

简介：C/C++图形库，包含很多图像处理类函数

使用方式：二者==没有太大的差别==，Easyx库里相对<u>新</u>一些

> #include<Easyx.h>
>
> 或 
>
> #include<graphics.h>

其余知识在以下C语言代码里

``` c
#include<stdio.h>
#include<easyx.h>
#include<mmsystem.h>  //mm:  multi-media  多媒体
#pragma comment(lib,"winmm.lib")  //打开库文件

int main()
{
	//创建窗口
	initgraph(800, 500);
	//常见颜色直接用大写单词即可
	WHITE;
	YELLOW;
	RED;
	//不常见颜色--使用RGB，红绿蓝参数0~255（00000000~11111111）
	RGB(151, 200, 145);

	//刷新
	cleardevice();

	//music   不是easyx的东西，是windows系统的东西
	//1、包含头文件mmsystem.h
	//2、包含库文件winmm.lib
	//注意：  音乐名字中间不可以有空格，不然无法识别，最好用QQ音乐下载的mp3歌曲，
	//网易云不行，网易云调整了微软的mp3格式文件
	mciSendString("open 皎洁的笑颜.mp3", 0, 0, 0); //打开该音乐文件，通常为mp3格式，三个0默认
	mciSendString("play 皎洁的笑颜.mp3", 0, 0, 0);//播放音乐
	//mciSendString("pause 音乐的名字+后缀", 0, 0, 0);//暂停
	//mciSendString("close 音乐的名字+后缀", 0, 0, 0);//关闭

	//文字
	settextcolor(RED);//设置文字颜色
	settextstyle(72,0,"宋体"); //72表示字体高度，0表示宽度自适应
	outtextxy(20, 200, "I Love You");
	
	//图片
	IMAGE a; //定义一个图像类变量
	loadimage(&a, "郭子楷.jpg"); //从文件中读取一张图片保存在a中
	putimage(0, 0, &a);	//输出图片，会覆盖前面输出的文字
	
	//图片是由像素点组成的，一个像素点由4个字节存储，一个字节8位
	//第一个八位表示透明通道，后三个八位表示RGB

	system("pause");
	return 0;
}
```

小知识：图片是由==像素点==组成的，一个像素点由==4个字节==存储，一个字节8位
		第一个八位表示透明通道，后三个八位表示RGB
