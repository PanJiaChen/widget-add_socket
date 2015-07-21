# 股票提示插件

------
This is a widget about stocks.When you input '$' ,there will appear a prompt box.Then you can stock number or others find the stock you want.

这是一个股票提示插件，当你敲下'$'时会弹出一个提示框（位置根据的光标决定），之后你就可以输入股票编号或者缩写之类找到你想要输出的股票（目前只支持沪深）。 目前对外只开放了一个接口 未完待续...

example [live here](http://panjiachen.github.io/cursor-location//) 输入$符号后 输入股票拼音或者股票编号即可
------

## textarea光标定位
你也可以将他作为一个textarea光标定位的插件，当你按下某个特定键时（此例子为$）会在你光标所停位置弹出下拉框，只要将数据源更改一下就可以作为它用。
该插件的实现方法大致就是在绑定的textarea生成一个隐藏的div，让div里面的内容和textarar保持一致，通过它来获取光标的相对位置。