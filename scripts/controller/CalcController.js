class CalcController{
    constructor(){
        this._memorizedValue = '';
        this._prevMemorizedValue = '';
        this._minusOperator = false;
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._operation=[0];
        this._lastOperator='';
        this._lastNumber='';
        this._displayCalcEl = document.querySelector('#display');
        
        this.initialize();
        this.initButtonsEvents();
        this.initKeyBoard();
    }

    initialize(){
        this.refreshDisplay();
        this.pasteFromClipboard();

        let c_soundOnOff = document.querySelector('#btn-c');
        c_soundOnOff.addEventListener(('dblclick'),event=>{
            this.toggleAudio();
        });
    }

    pasteFromClipboard(){
        document.addEventListener('paste', event=>{
            let text = parseFloat(event.clipboardData.getData('Text'));
            !isNaN(text) && this.addOperation(text);
        })
    }

    copyToClipboard(){
        let input = document.createElement('input');
        input.value = this.displayCalc;
        document.body.appendChild(input);
        input.select();
        document.execCommand('Copy');

        input.remove();
    }

    toggleAudio(){
        this._audioOnOff = !this._audioOnOff;
    }

    playAudio(){
        if(this._audioOnOff){
            this._audio.currentTime=0;
            this._audio.play();
        }
    }

    initButtonsEvents(){
        let buttons = document.querySelectorAll('#buttons > div > button');
        
        buttons.forEach((btn,index)=>{

            this.addEventListenerAll(btn,'click drag', event =>{
                let textBtn = btn.id.replace('btn-','')
                this.execBtn(textBtn);
            })
        })
    }

    addEventListenerAll(element,events, fn){
        events.split(' ').forEach(event => {
            element.addEventListener(event,fn,false);
        })
    }

    initKeyBoard(){
        document.addEventListener('keyup',event=>{
            this.playAudio();
            switch(event.key){
                case 'Escape':
                    this.clearAll();
                    break;
                case 'Backspace':
                    this.cancelEntry();
                    break;
                case '+':
                case '-':
                case '/':
                case '*':
                case '%':
                    this.addOperation(event.key);
                    break;
                case 'Enter':
                case '=':
                    this.calc();
                    break;
                case '.':
                case ',':
                    this.addDot();
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
                    this.addOperation(parseInt(event.key));
                    break;  
                case 'c':
                    if(event.ctrlKey){
                        this.copyToClipboard();
                    }      
                default:
                    break;
            }
        })
    }

    execBtn(value){
        this.playAudio();
        switch(value){
            case 'c':
                this.clearAll();
                break;
            case 'ce':
                this.cancelEntry();
                break;
            case 'plus':
                this.addOperation('+');
                break;
            case 'minus':
                this.addOperation('-');
                break;
            case 'divide':
                this.addOperation('/');
                break;
            case 'multiply':
                this.addOperation('*');
                break;
            case 'percent':
                this.addOperation('%');
                break;
            case 'squareRoot':
                this.addSpecialOperation('sqrt');
                break;
            case 'square':
                this.addSpecialOperation('square');
                break;
            case 'inversal':
                this.addSpecialOperation('inv');
                break;
            case 'backspace':
                this.backspace();
                break;    
            case 'changeSignal':
                this.changeSignal();
                break;
            case 'equal':
                this.calc();
                break;
            case 'comma':
                this.addDot();
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

    backspace(){
        let lastItem = this.getLastItem(false);
       
        if(lastItem && typeof lastItem === 'string' && lastItem !=0){
            let value = lastItem.split('');
            if(value.length>1){
                value.pop();
                value = value.join('')
                this.setLastOperation(value);
            }else{
                this.setLastOperation(0);
            }
        }
        this.refreshDisplay();
    }

    addSpecialOperation(value){
        this.isOperator(this.getLastOperation()) && this._operation.pop();
        try{
            let result;

            switch(value){
                case 'sqrt':
                    if(!this._minusOperator){
                        result = Math.sqrt(eval(this.getLastOperation()));
                        result = this.decimalLimit(result);
                        this._operation = [result];
                        this.refreshDisplay();
                    }else{
                        this.setError();
                    }
                    break;
                case 'square':
                    result = Math.pow(eval(this.getLastOperation()),2);
                    result = this.decimalLimit(result);
                    this._operation = [result];
                    this.refreshDisplay();
                    break;
                case 'inv':
                    if(this.getLastOperation() && this.getLastOperation()!=0 ){
                        result = Math.pow(eval(this.getLastOperation()),-1);
                        result = this.decimalLimit(result);
                        this._operation = [result];
                        this.refreshDisplay();
                    }else{
                        this.setError();
                    }
                        
                    break;
            }
        }catch(e){
            console.log(e);
            this.setError();
        }
        
    }

    changeSignal(){
        this._minusOperator = !this._minusOperator;
        let lastItem = this.getLastItem(false);
        let regex = eval('/[\b(\b)]/g')
        if(lastItem && lastItem!=0 && !this.isOperator(this.getLastOperation())){
            if(this._minusOperator){
                    this.setLastOperation('(-' + this.getLastItem(false).toString().replace('-','').replace(regex,'') + ')');
            }else{
                this.setLastOperation(this.getLastItem(false).toString().replace('-','').replace(regex,''));
            }
            
            this.refreshDisplay();
        }
        
    }

    addDot(){
        let lastOperation = this.getLastOperation();

        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.')>-1){
            return;
        }

        if(this.isOperator(lastOperation) || !lastOperation){
            this.pushOperator('0.');
        }else{
            this.setLastOperation(lastOperation.toString() + '.');
        }

        this.refreshDisplay();
    }

    addOperation(value){
        this._minusOperator = false;
        if(isNaN(this.getLastOperation())){
            if(this.isOperator(value)){
                this.pushOperator(value);
            }else{
                this.pushOperator(value);
                this.refreshDisplay();
            }
        }else{
            if(this.isOperator(value)){
                this.pushOperator(value);
            }else{
                let newValue = this.getLastOperation() != 0 || this.getLastOperation(false).toString().indexOf('.') >-1 ? this.getLastOperation().toString() + value.toString() : value.toString();
                this.setLastOperation(newValue);
                this.refreshDisplay();
            }
        }
    }

    pushOperator(value){
        this._operation.push(value);
        this._operation.length > 3 && this.calc();
    }

    clearMemoValue(){
        this._memorizedValue = '';
    }

    setMemoValue(){

        if(this._memorizedValue==='' || this._prevMemorizedValue !== this._memorizedValue) {

            this._memorizedValue = this._prevMemorizedValue ==='' ? this.getLastItem(false):this._prevMemorizedValue;
        }
        
    }

    setPrevMemoValue(){
           this._prevMemorizedValue = this.getLastItem(false);
    }

    
    calc(){
        let last='';
        this._minusOperator=false;
        this._lastOperator = this.getLastItem();
        let firstItem = this._operation[0];
        
        if(this._operation.length<3 && this._lastOperator){
            (this._prevMemorizedValue ==='' || this._prevMemorizedValue ==0 )&& this.setPrevMemoValue();
            this.setMemoValue();
            
            this._operation = [firstItem, this._lastOperator, this._memorizedValue]
        }else if(this._operation.length > 3){
            this.setPrevMemoValue();
            last = this._operation.pop();
            this._lastNumber = this.getResult();
        }else if(this._operation.length===3){
            this.setPrevMemoValue();
            this._lastNumber = this.getLastItem(false);
        }

        let result = this.getResult();
        
        switch(last){
            case '%':
                result /=100;
                
                this._operation=[result];
                break;
            
            default:
                
                this._operation = [result];
                
                last && this._operation.push(last);
                break;
        }
        this._minusOperator = result.toString().indexOf('-')>-1;
        this._lastNumber = this._lastNumber && this._operation.length>=3 ? result : firstItem;
        this.refreshDisplay();
    };


    getResult(){
        try{
            let result = eval(this._operation.join(''));
            
            result = this.decimalLimit(result);
            return result;
        }catch(e){
            setTimeout(()=>{
                console.log(e)
                this.setError();
            },1);
        }
    };

    decimalLimit(value){
        
        if(value.toString().indexOf('.') > -1){
            let integerAlgarisms
            const stringValue = value.toString();
            const dotPosition = stringValue.indexOf('.');
            
            if(Math.abs(value)>0 && Math.abs(value)<0.000001){
                return 0;
                
            }else
            if(Math.abs(value) >0.0000001 && Math.abs(value)<1){
                
                const decimalAlgarisms = stringValue.substr(dotPosition + 1, (stringValue.length - (dotPosition + 1)))

                return decimalAlgarisms.length > 6 ? value.toFixed(7) : value.toFixed(decimalAlgarisms.length)
            }
            else{
              
                integerAlgarisms = value === 1 ? 1 : Math.ceil(Math.log10(Math.abs(value)));
              
                return (integerAlgarisms && integerAlgarisms < 8) ? eval(value.toFixed(integerAlgarisms)) : value.toFixed(0);
            }
            
        }
        return value;
    };

    getLastOperation(){
        return this._operation[this._operation.length-1];
    };

    setLastOperation(value){
        this._operation[this._operation.length-1] = value;
        };

    cancelEntry(){
        this._operation.pop();
        if(this._operation.length === 1) {
            this._lastNumber = ''
        };
        this.refreshDisplay();
    };

    clearAll(){
        this._operation=[0];
        this._lastOperator='';
        this._lastNumber='';
        this._prevMemorizedValue='';
        this.clearMemoValue();
        this.refreshDisplay();
    };

    refreshDisplay(){
        let lastNumber = this.getLastItem(false);
        
        if(!lastNumber || lastNumber===''){
            
            lastNumber=0;
        }
        
        this.displayCalc = this._operation.length === 1 ?

            this._operation[0].toString().indexOf('.')>-1 ? this._operation[0] : eval(this._operation[0]) : 
            lastNumber.toString().indexOf('.')>-1 ? lastNumber : eval(lastNumber) ;
            
    };

    getLastItem(isOperator = true){
        let lastItem;
        for(let i = this._operation.length-1;i>=0;i--){
            if(this.isOperator(this._operation[i])===isOperator){
                lastItem = this._operation[i];
                
                return lastItem;
            }
        }
        if(!lastItem){
            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;
        }
        
        return lastItem;
    };

    isOperator(value){
        return (['+','-','*','/','%','sqrt','square','inv'].indexOf(value)>-1);
            
    };

    setError(){
        this.displayCalc='Error';
    };


    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    };

    set displayCalc(value){
        if(value.toString().length>10){
            this.setError();
            return false;
        }

        this._displayCalcEl.innerHTML = value;
    };
    
}
