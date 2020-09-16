class CalcController {
    constructor() {
        this._audio = new Audio('click.mp3')
        this._audioOnOff = false;
        this._lastNumber = '';
        this._lastOperator = '';
        this._operation = [];
        this._dateEl = document.querySelector('.date');
        this._hourEl = document.querySelector('.hour');
        this._displayResult = document.querySelector('#resultValue');
        this.initialize();
        this.initButtons();
        this.initKeyboard();
    }

    initialize() {
        this.setDisplayDateTime();

        setInterval(()=>{
            this.setDisplayDateTime()
        }, 1000);

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        let btnAC = document.querySelector('.btn-ac');

        btnAC.addEventListener('dblclick', (e)=> {
            this.toggleAudio();
        });
    }

    toggleAudio() {

        this._audioOnOff = !this._audioOnOff;

    }

    playAudio() {

        if(this._audioOnOff) {
            this._audio.currentTime = 0;
            this._audio.play();
        }

    }

    setDisplayDateTime() {
        this.displayDate= this.currentDate.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',        
        });

        this.displayTime = this.currentDate.toLocaleTimeString('pt-BR')
    }

    clearAll() {
        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();

    }

    clearEntry() {
        this._operation.pop();
        this.displayResult = '0'
    }

    setError() {
        this.displayResult = 'ERROR'
    }

    getLastOperation() {
        return this._operation[this._operation.length - 1]
    }

    setLastOperation(value) {
        this._operation[this._operation.length -1] = value;
    }

    isOperator(value) {
        let operators = ['+', '-', '*', '/', '%'];

        return (operators.indexOf(value) > -1);
    }

    getResult() {
        try {
            return eval(this._operation.join(''));
        } catch(e) {
            setTimeout(() => {
                this.setError();
            }, 1);
        }
        
    }

    pushOperation(value) {
        this._operation.push(value);

        if(this._operation.length > 3) {
            this.calc();
            console.log('oi')
        }
    }

    calc() {

        let last = '';

        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3){

            let firstNumber = this._operation[0]

            this._operation = [firstNumber, this._lastOperator, this._lastNumber]

        } else if(this._operation.length > 3) {
            
            last = this._operation.pop();

            this._lastNumber = this.getResult();

        } else if(this._operation.length == 3) {
            this._lastNumber = this.getLastItem(false);
        }
        

        let result = this.getResult();

        if(last === '%') {
            result = result/100

            this._operation = [result]
        } else {
            this._operation = [result]

            if(last) {
                this._operation.push(last);
            }
           
        }

        this.setLastNumberToDisplay();
    }

    setLastNumberToDisplay() {
        let lastNumber = this.getLastItem(false)

        if(!lastNumber) {
            this.displayResult = '0';
        } else {
            this.displayResult = lastNumber;   
        }
       
    }

    getLastItem(isOperator = true) {
        let lastItem;

        for(let i = this._operation.length -1; i >= 0; i--) {
            if((this.isOperator(this._operation[i])) == isOperator) {

                lastItem = this._operation[i];
                break;

            } 
        }

        if(!lastItem) {
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        } 
        
        return lastItem;
    }

    addOperation(value) {
        if(isNaN(this.getLastOperation())) {
            //último valor não é um número, pode ser um operador ou undefined
            
            if(this.isOperator(value)) {
                //Valor atual é um operador
                this.setLastOperation(value);
            } else {
                this.pushOperation(value);
                this.setLastNumberToDisplay();
            }

        } else {

            if(this.isOperator(value)) {
                //Valor atual é um operador
                this.pushOperation(value);

            } else {
               
                //Valor atual não é um operador
                if(this.getLastOperation() == '0'){
                    this.setLastOperation('0')
                } else {
                    let newValue = this.getLastOperation().toString() + value.toString()
                    this.setLastOperation(newValue);
                    this.setLastNumberToDisplay();
                }
                
            }
            
        }
    }

    addDot() {
        let lastItem = this.getLastOperation();

        if(typeof lastItem === 'string' && lastItem.split('').indexOf('.') > -1) return;

        if(this.isOperator(lastItem) || !lastItem){
            
            if(lastItem == '0') {
                this.setLastOperation('0.')
            } else {
                this.pushOperation('0.');
            }
            
        } else {
            let newValue = lastItem.toString() + '.';
            this.setLastOperation(newValue)
        }

        this.setLastNumberToDisplay();
    }

    execButton(value) {

        this.playAudio();

        switch(value) {
            case 'ac':
                this.clearAll();
                break;
            case 'ce':
                this.clearEntry();
                break;
            case 'soma':
                this.addOperation('+');
                break;
            case 'subtracao':
                this.addOperation('-');
                break
            case 'divisao':
                this.addOperation('/');
                break;
            case 'multiplicacao':
                this.addOperation('*')
                break;
            case 'porcento':
                this.addOperation('%')
                break;
            case 'igual':
                this.calc()
                break;
            case 'ponto':
                this.addDot('.')
                break;
            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;
            
            default:
                this.setError();
                break;
        }
    }

    addEventListenerAll(btn, events, fn) {
        let btnEvents = events.split(' ');

        btnEvents.forEach((event)=> {
            btn.addEventListener(event, fn, false)
        })
        
    }

    initButtons() {
        let buttons = document.querySelectorAll('[class^="btn"]');

        buttons.forEach((button)=>{
            this.addEventListenerAll(button, 'click drag', (e)=> {
                let nameBtn = button.className.replace('btn-', '');
                this.execButton(nameBtn)
            });

            button.addEventListener('mousedown', (e)=> {
                button.style.backgroundColor = '#686868'
            })

            button.addEventListener('mouseup', (e)=> {
                button.style.backgroundColor = '#333435'
            })
        })
    }

    

    initKeyboard() {
        document.addEventListener('keyup', (e)=>{
            this.playAudio()

            switch(e.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.clearEntry();
                    break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(e.key);
                    break; 
                case 'Enter':
                case '=':
                    this.calc()
                    break;
                case '.':
                case ',':
                    this.addDot('.')
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;

            }
            
        })
    }

    pasteFromClipboard() {
        document.addEventListener('paste', (e)=>{
            let text = e.clipboardData.getData('Text')
            
            this.displayResult = parseFloat(text);
            this.pushOperation(text.toString())
        })
    }


    copyToClipboard() {
        let result = this._displayResult;

        result.select();

        document.execCommand('Copy');
    }


    get displayDate() {
        return this._dateEl.innerHTML;
    }

    set displayDate(value) {
        this._dateEl.innerHTML = value;
    }

    get displayTime() {
        return this._hourEl.innerHTML;
    }

    set displayTime(value) {
        this._hourEl.innerHTML = value;
    }

    get displayResult() {
        return this._displayResult.value; 
    }

    set displayResult(value) {
        if(value.toString().length > 12) {
            this.setError();
            return false;
        }

        return this._displayResult.value = value;
    }

    get currentDate() {
        return new Date()
    }
}