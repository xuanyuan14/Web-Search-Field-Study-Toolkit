# Web-Search-Field-Study-Toolkit

## Updates 09/17/2021
Environment compatibility
Python 3.9.2
Django 3.2.7

### Installation
1. run once to initialize
```bash
python manage.py makemigrations
python manage.py migrate
```
2. launch the server
```bash
python manage.py runserver 127.0.0.1:8000
```

### TODO
1. No query records from search engine
2. Integration with Google
3. Closed document search

-----

Make field study easier to conduct!

[![THUIR](https://img.shields.io/badge/THUIR-ver%201.0-blueviolet)](http://www.thuir.cn)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![made-with-python](https://img.shields.io/badge/Made%20with-Python-red.svg)](#python)
[![made-with-js](https://img.shields.io/badge/Made%20with-JS-yellow.svg)](#javascript)
[![repo-size](https://img.shields.io/github/repo-size/xuanyuan14/Web-Search-Field-Study-Toolkit?color=green)]()

## Introduction
This codebase contains source-code of the field study platform of our WWW 2021 paper:
  - [Chen, Jia, et al. "Towards a Better Understanding of Query Reformulation Behavior in Web Search." Proceedings of the Web Conference 2021. 2021.](https://dl.acm.org/doi/abs/10.1145/3442381.3450127)

## Overview
<p align="center">
  <img src="https://github.com/xuanyuan14/Web-Search-Field-Study-Toolkit/blob/master/images/overview.png">
</p>  

## List of Recorded Information
* Pre-query expectation: such as ```diversity```, ```result type```, ```redundancy```, ```difficulty```, ```number of relevant results```, ```effort```.
* Query reformulation: such as ```reformulation type```, ```reformulation interface```, ```reformulation reason```, ```reformulation inspiration source```, etc.
* Query-level result usefulness: 4-scale, 0--useless, 1--partially useful, 2--very useful, 3--serendipity.
* Query-level and session level user satisfaction: both are 5-scale.
* Search behavior log: such as mouse movement, search queries, and timestamps.

You can add or delete any function on your need. BTW, we are delighted to introduce the dataset we collected via this toolkit: [TianGong-Qref](http://www.thuir.cn/tiangong-qref/). 🤠

## Support
Fow now, this toolkit only support the logging on Baidu and Sogou, which are two largest commercial search engines in China. We welcome anyone to implement the support for more search engines such as Google, Bing, Yahoo, and Naver.

## How to launch
* As our toolkit use MongoDB to store data, you should first make sure that your django backend has been connected to a running MongoDB engine. Try the following script on Linux OS/MacOS to make sure that you have launched the MongoDB correctly:
```bash
cd /usr/local/bin
sudo ./mongod
```
Then open another terminal window and run the following command:
```bash
cd /usr/local/bin
./mongo
```
If you have any problems about MongoDB, please refer to this [tutorial](https://www.tutorialspoint.com/mongodb/index.htm).

* You can then launch the django backend with the following command:
```bash
python manage.py runserver 0.0.0.0:8000
```
* Install the chrome extension on your Google chrome.  

<p align="center">
  <img src="https://github.com/xuanyuan14/Web-Search-Field-Study-Toolkit/blob/master/images/install.png">
</p>  

* Login at the annotation platform (0.0.0.0:8000) and register a new account.

* Click the extension logo and login with the account.

<p align="center">
  <img src="https://github.com/xuanyuan14/Web-Search-Field-Study-Toolkit/blob/master/images/login.png">
</p>

* Now, all things get ready! Just start your field study!

## Some things you should notice
* The baseURL in the extension should be the same with the base URL of the annotation platform.
```javascript
var baseUrl = "http://127.0.0.1:8000";
```  
* You should ensure that the chrome extention is on before the search, or nothing will be recorded.  

<p align="center">
  <img width="50" height="50" src="https://github.com/xuanyuan14/Web-Search-Field-Study-Toolkit/blob/master/images/on.png">
</p>

* There may be problems in query recording if search users submit queries very frequently, e.g., submit two queries within 1 second. Please ask the participants to search with normal speed. We also welcome anyone to fix this bug.
* Each query that has been recorded should be annotated within **48** hours, or they will be removed in case that users have forgotten the search details.
* It is normal to have error as follows when submitting the annotations for a query. Just return the previous page and submit again.

<p align="center">
  <img src="https://github.com/xuanyuan14/Web-Search-Field-Study-Toolkit/blob/master/images/error.png">
</p>

* For Baidu, you should 1) shut down the instance predicton function, and 2) set all SERPs to be opened in a new window. Without these settings, search pages will be updated merely by in-page javascript functions and our toolkit will be failed to record correct information. 

<p align="center">
  <img src="https://github.com/xuanyuan14/Web-Search-Field-Study-Toolkit/blob/master/images/close.png">
</p>

<p align="center">
  <img src="https://github.com/xuanyuan14/Web-Search-Field-Study-Toolkit/blob/master/images/setting.png">
</p>

## Citation
If you find the resources in this repo useful, please do not save your star and cite our work:

```bibtex
@inproceedings{chen2021towards,
  title={Towards a Better Understanding of Query Reformulation Behavior in Web Search},
  author={Chen, Jia and Mao, Jiaxin and Liu, Yiqun and Zhang, Fan and Zhang, Min and Ma, Shaoping},
  booktitle={Proceedings of the Web Conference 2021},
  pages={743--755},
  year={2021}
}
```

## Contact
If you have any questions, please feel free to contact me via [chenjia0831@gmail.com]() or open an issue.

## Acknowledgement
This toolkit is built based on the prototype systems that were used in several previous work: 
* [Mao, Jiaxin, et al. "When does relevance mean usefulness and user satisfaction in web search?" Proceedings of the 39th International ACM SIGIR conference on Research and Development in Information Retrieval. 2016.](http://www.thuir.org/group/~YQLiu/publications/sigir2016Mao.pdf)
* [Wu, Zhijing, et al. "The influence of image search intents on user behavior and satisfaction." Proceedings of the Twelfth ACM International Conference on Web Search and Data Mining. 2019.](http://www.thuir.org/group/~YQLiu/publications/WSDM19Wu.pdf)
* [Zhang, Fan, et al. "Models versus satisfaction: Towards a better understanding of evaluation metrics." Proceedings of the 43rd International ACM SIGIR Conference on Research and Development in Information Retrieval. 2020.](https://static.aminer.cn/upload/pdf/1982/1327/2004/5f0277e911dc830562231df7_0.pdf)
* [Zhang, Fan, et al. "Cascade or recency: Constructing better evaluation metrics for session search." Proceedings of the 43rd International ACM SIGIR Conference on Research and Development in Information Retrieval. 2020.](http://www.thuir.cn/group/~mzhang/publications/SIGIR2020-ZhangFan1.pdf)  
We thank the authors for their great work.
