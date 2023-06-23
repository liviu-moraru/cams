# Instalare pe Windows

## Varianta 1. Instalare Python 3

1. De pe situl [Python.org](https://www.python.org/downloads/) descărcați varianta de installer (ex. pt. [64 biti](https://www.python.org/ftp/python/3.10.11/python-3.10.11-amd64.exe))
2. După ce descărcarea este finalizată, deschideți fișierul .exe. Asigurați-vă că bifați opțiunea "Add Python to PATH" în timpul procesului de instalare. Aceasta va permite utilizarea Python în linia de comandă.
3. Urmați pașii indicați pentru a instala Python 3 pe sistemul dumneavoastră.
4. Descărcați local arhiva proiectului  de la adresa [https://github.com/liviu-moraru/cams/archive/refs/heads/main.zip](https://github.com/liviu-moraru/cams/archive/refs/heads/main.zip) 
5. Dezarhivați arhiva într-un folder local. 
6. Dezarhivarea va crea un folder cu numele `cams-main`
7. Deschideți linia de comandă (Command Prompt) sau PowerShell. Pentru a face acest lucru, puteți apăsa combinația de taste "Win + X" și alegeți "Command Prompt" sau "PowerShell" din meniu.
8. Din linia de comanda setați folderul curent `cams-main`, folosind comanda `cd`
9. In linia de comandă, in directorul `cams-main`

```
python -m venv .venv <Enter>
.venv\Scripts\activate <Enter>
pip install -r requirements.txt <Enter>
python server.py <Enter>
```
10. In acest moment aplicația va rula în linia de comandă. Ea se oprește cu combinația `Ctrl + C`
11. In acest moment aplicatia este disponibila. In browser se viziteaza aplicatia la `http://localhost:8080/`
12. Pentru oprirea aplicației, după apăsarea combinației Ctrl + C, se continuă in linia de comandă

```
deactivate <Enter>
```

## Varianta 2. Rulare in container prin docker pe Windows

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

# Modificarea structurii tabelelor si a interfetei

- Documentatia se gaseste [aici](jam-py.pdf).
- Se intra in pagina http://localhost:8080/builder.html
- Datele de logare sunt: user:admin, password: 1234
