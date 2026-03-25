# Come salvare la tua Calcolatrice su GitHub

Hai creato una bellissima calcolatrice scientifica! Ecco i passaggi per caricarla sul tuo profilo GitHub:

## 1. Crea un nuovo repository su GitHub
- Vai su [github.com/new](https://github.com/new)
- Dai un nome al repository (es: `scientific-calculator-glass`)
- Clicca su **"Create repository"** (non aggiungere README, .gitignore o licenza, li abbiamo già!)

## 2. Collega il tuo progetto locale a GitHub
Apri il terminale nella cartella del progetto ed esegui questi comandi (sostituisci `TUO_UTENTE` e `NOME_REPO` con i tuoi dati):

```bash
git remote add origin https://github.com/TUO_UTENTE/NOME_REPO.git
git branch -M main
git push -u origin main
```

## 3. Finito!
Il tuo codice è ora su GitHub. Ogni volta che fai nuove modifiche, ti basta fare:
```bash
git add .
git commit -m "Descrizione modifica"
git push
```
