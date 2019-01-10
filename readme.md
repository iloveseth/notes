# README--Javascript

## 0103

### `lodash`

```
var _ = require('lodash');
_.chunk(array, [size=0])//将数组拆分成多个 size 长度的块，并组成一个新数组
_.compact(array)//创建一个移除了所有假值的数组，例如：false、null、 0、""、undefined， 以及NaN
_.concat(array, [values])//创建一个用任何数组或值连接的新数组
_.difference(array, [values])//创建一个差异化后的数组（差集）
_.differenceBy(array, [values], [iteratee=_.identity])//iteratee 会传入一个参数：(value)[iteratee=_.identity] (Function|Object|string)
_.drop(array, [n=1])//裁剪数组中的前N个数组，返回剩余的部分
_.dropWhile(array, [predicate=_.identity])//裁剪数组，起点从 predicate 返回假值开始
_.dropRight,dropRightWhile
_.fill(array, value, [start=0], [end=array.length])
_.findIndex(array, [predicate=_.identity]),_.findLastIndex(array, [predicate=_.identity])
_.flatten(array)//向上一级展平数组嵌套
_.flattenDeep(array)
_.flattenDepth(array, [depth=1])
_.head(array)//获得数组的首个元素
_.last(array)//返回数组中的最后一个元素
_.initial()//获取数组中除了最后一个元素之外的所有元素
_.tail(array)//获取数组中除了第一个元素的剩余数组
_.indexOf(array, value, [fromIndex=0])//根据 value 使用 SameValueZero 等值比较返回数组中首次匹配的 index
_.lastIndexOf(array, value, [fromIndex=array.length-1])
_.intersection([arrays])//
_.intersectionBy([arrays], [iteratee=_.identity])
_.intersectionWith([arrays], [comparator])
_.join(array, [separator=','])
_.pull(array, [values])//移除所有经过 SameValueZero 等值比较为 true 的元素 这个方法会改变数组。_.without
_.pullAll(array, values)// _.difference
_.pullAllBy(array, values, [iteratee=_.identity])//接受一个 comparator 调用每一个数组元素的值。 comparator 会传入一个参数 _.differenceBy
_.pullAt(array, [indexes])//根据给的 indexes 移除对应的数组元素并返回被移除的元素。 _.at
_.remove(array, [predicate=_.identity])//移除经过 predicate 处理为真值的元素，并返回被移除的元素 会改变数组
_.slice(array, [start=0], [end=array.length])//创建一个裁剪后的数组，从 start 到 end 的位置
_.sortedIndex(array, value)//使用二进制的方式检索来决定 value 应该插入在数组中位置
_.sortedIndexBy(array, value, [iteratee=_.identity])//
_.sortedIndexOf(array, value)//
_.sortedLastIndex(array, value)//
_.sortedLastIndexBy(array, value, [iteratee=_.identity])
_.sortedLastIndexOf(array, value)
_.sortedUniq(array)
_.sortedUniqBy(array, [iteratee])
_.take(array, [n=1])//从数组的起始元素开始提取 N 个元素。
_.takeRight(array, [n=1])
_.takeWhile(array, [predicate=_.identity])//从数组的开始提取数组，直到 predicate 返回假值。predicate 会传入三个参数：(value, index, array)。
_.takeRightWhile(array, [predicate=_.identity])
```

### `moment`

```
```