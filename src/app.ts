
//Validation
interface Validateable{
    value : string|number;
    required?: boolean;
    minLength?: number;
    maxLength?:number;
    min?: number;
    max?: number
}

function validate(validateableInput: Validateable){
    let isValid = true;
    if(validateableInput.required){
         isValid = isValid && validateableInput.value.toString().trim().length!==0;
    }
    if(
        validateableInput.minLength !=null&& 
        typeof validateableInput.value==='string'){
        isValid = isValid && validateableInput.value.length>validateableInput.minLength;
    }
    if(
        validateableInput.maxLength !=null&& 
        typeof validateableInput.value==='string'){
        isValid = isValid && validateableInput.value.length<validateableInput.maxLength;
    }
    if(
        validateableInput.min !=null&&
        typeof validateableInput.value === 'number'
    ){
        isValid = isValid && validateableInput.value > validateableInput.min;
    }
    if(
        validateableInput.max !=null&&
        typeof validateableInput.value === 'number'
    ){
        isValid = isValid && validateableInput.value < validateableInput.max;
    }
    return isValid
}
//
function autobind(
    _:any,
    _2:string, 
    descriptor: PropertyDescriptor
){
    const originalMethod= descriptor.value;
    const adjDescriptor:PropertyDescriptor={
        configurable:true,
        get(){
            const boundFn = originalMethod.bind(this);
            return boundFn;
        }
    };
    return adjDescriptor;
}

class ProjectInput{
    templateElement : HTMLTemplateElement;
    hostElement : HTMLDivElement;
    element : HTMLFormElement;
    titleInputElement : HTMLInputElement;
    descriptionInputElement : HTMLInputElement;
    peopleInputElement : HTMLInputElement;

    constructor(){
        this.templateElement = document.getElementById('project-input')! as HTMLTemplateElement;
        this.hostElement = document.getElementById('app')! as HTMLDivElement

        const importNode = document.importNode(this.templateElement.content, true);
        this.element = importNode.firstElementChild as HTMLFormElement;
        this.element.id= 'user-input';
        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;
        this.attach();
        this.configure();
    }

    private gatherUserInput(): Array<string|number> | void{
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        const titleValidateable: Validateable ={
            value: enteredTitle,
            required : true
        };
        const descValidateable: Validateable ={
            value: enteredDescription,
            required : true,
            minLength:5
        };
        const peopleValidateable: Validateable ={
            value: enteredPeople,
            required : true,
            min:1
        };
        if(
            validate(titleValidateable)||
            validate(descValidateable)||
            validate(peopleValidateable)
        ){
             alert('Invalid input!')
             return;
        }else{
            return [enteredDescription, enteredDescription, +enteredPeople];
        }
    }

    private clearInput(){
        this.descriptionInputElement.value = '';
        this.titleInputElement.value='';
        this.peopleInputElement.value=''
    }
    @autobind
    private submintHandler(event:Event){
        event.preventDefault();
        const userInput = this.gatherUserInput()
        if(Array.isArray(userInput)){
            const [title, desc,people]=userInput;
            console.log(title, desc,people);  
            this.clearInput()
        }
        console.log(this.titleInputElement.value);
        console.log(this.descriptionInputElement.value);
        console.log(this.peopleInputElement.value);
    }

    private configure(){
        this.element.addEventListener('submit', this.submintHandler)
    }
    private attach(){
        this.hostElement.insertAdjacentElement('afterbegin', this.element);
    }
}

const projectContent = new ProjectInput();