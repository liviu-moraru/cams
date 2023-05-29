## Rulare in container prin docker pe Windows

1. Se instaleaza `Docker Desktop` de pe situl [https://www.docker.com/](https://www.docker.com/)
2. Se instaleaza [Git for Windows](https://gitforwindows.org/)
3. Se deschide un terminal. In continuare se va lucra in acest terminal.
3. Intr-un director local se cloneaza proiectul
```
git clone https://github.com/liviu-moraru/cams.git
``` 
4. Se seteaza `cams` ca director curent.

```
cd cams
```
5. Se creaza imaginea pentru container.

```
docker build -t cams .
```
6. Se creaza si ruleaza containerul

```
docker run -v .:/app -p 8080:8080 --name cams cams
```
7. In acest moment aplicatia este disponibila. In browser se viziteaza aplicatia la `http://localhost:8080/`
8. Pentru oprirea aplicatiei, intr-o alta fereastra de terminal

```
docker stop cams
```
9. Pentru repornirea ei

```
docker start cams
```