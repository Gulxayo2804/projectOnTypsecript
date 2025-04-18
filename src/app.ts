enum ProjectStatus{
    Active,
    Finished
} 
class Project {
    constructor(
        public id: string, 
        public title:string, 
        public description:string, 
        public people: number, 
        public status: ProjectStatus
    ){

    }
}

type Listener=(items: Project[])=> void;

// class State {

// }
// Project State Management
class ProjectState{
    private listeners: Listener[]=[];
    private projects : Project[]=[];
    private static instance : ProjectState;
    private constructor(){

    }

    static getInstance(){
        if(this.instance){
            return this.instance;
        }
        this.instance = new ProjectState();
        return this.instance;
    }
    addListener(listenerFn : Listener){
        this.listeners.push(listenerFn)
    }
    addProject(title:string, description: string, numOfPeople:number){
        const newProject = new Project(
            Math.random.toString(), 
            title, 
            description, 
            numOfPeople, 
            ProjectStatus.Active)
        this.projects.push(newProject);
        for(const listenerFn of this.listeners){
            listenerFn(this.projects.slice());
        }
    }
}

const projectState = ProjectState.getInstance()
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
};

abstract class Component<T extends HTMLElement, U extends HTMLElement>{
    templateElement : HTMLTemplateElement;
    hostElement : T;
    element : U;

    constructor(
        templateId: string,
        hostElementId: string,
        insertAtStarts: boolean,
        newElementId?: string
    ){
        this.templateElement = document.getElementById(templateId)! as HTMLTemplateElement;
        this.hostElement = document.getElementById(hostElementId)! as T;

        const importNode = document.importNode(this.templateElement.content, true);
        this.element = importNode.firstElementChild as U;
        if(newElementId){
        this.element.id= newElementId;
        }
        this.attach(insertAtStarts)
    }
    private attach(insertAtBeginig: boolean){
        this.hostElement.insertAdjacentElement(insertAtBeginig?'afterbegin':'beforebegin', this.element);
    }
    abstract configure():void;
    abstract renderContent(): void;
}

class ProjectList extends Component<HTMLDivElement, HTMLElement>{
    assignedProjetcs: Project[];
    constructor(private type:'active'|'finished'){
        super('project-list', 'app', false, `${type} - projects`)
        this.assignedProjetcs=[]

        this.configure();
        this.renderContent();
    }

      configure(){
        projectState.addListener((projects: Project[])=>{
            const relevenantProjects = projects.filter(prj=>{
                if(this.type === 'active'){
                    return prj.status === ProjectStatus.Active;
                }
                return prj.status === ProjectStatus.Finished;
            })
            this.assignedProjetcs = relevenantProjects;
            this.renderProjects()
        })
    }

    renderContent(){
        const listId = `${this.type}-project-list`;
        this.element.querySelector('ul')!.id=listId;
        this.element.querySelector('h2')!.textContent = this.type.toLocaleUpperCase()+' PROJECTS';

    }

    private renderProjects(){
        const listEl = document.getElementById(`${this.type}-project-list`)!;
        listEl.innerHTML='';
        for(const prjItem of this.assignedProjetcs){
            const listItem = document.createElement('li');
            listItem.textContent = prjItem.title;
            listEl?.appendChild(listItem)
        }
    }

  
}

class ProjectInput extends Component<HTMLDivElement, HTMLFormElement>{
    titleInputElement : HTMLInputElement;
    descriptionInputElement : HTMLInputElement;
    peopleInputElement : HTMLInputElement;

    constructor(){
        super('project-input', 'app', true,'user-input' )

        this.titleInputElement = this.element.querySelector('#title')! as HTMLInputElement;
        this.descriptionInputElement = this.element.querySelector('#description')! as HTMLInputElement;
        this.peopleInputElement = this.element.querySelector('#people')! as HTMLInputElement;
        this.configure();
    }

    configure(){
        this.element.addEventListener('submit', this.submintHandler)
    }
    renderContent(): void {}
    private gatherUserInput(): [string, string, number] | void{
        const enteredTitle = this.titleInputElement.value;
        const enteredDescription = this.descriptionInputElement.value;
        const enteredPeople = this.peopleInputElement.value;
        const titleValidateable: Validateable ={
            value: enteredTitle,
            required : true
        };
        const descValidateable: Validateable ={
            value: enteredDescription,
            required : true
            // minLength:5
        };
        const peopleValidateable: Validateable ={
            value: enteredPeople,
            required : true
        };
        if(
            validate(titleValidateable)||
            validate(descValidateable)||
            validate(peopleValidateable)
        ){
            return [enteredDescription, enteredDescription, +enteredPeople];
        }else{
            alert('Invalid input!')
            return;
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
            projectState.addProject(title, desc, people);
            console.log(title, desc,people);  
            this.clearInput()
        }
        console.log(this.titleInputElement.value);
        console.log(this.descriptionInputElement.value);
        console.log(this.peopleInputElement.value);
    }
}

const projectContent = new ProjectInput();
const activePrjList = new ProjectList('active');
const finishedPrjList = new ProjectList('finished');