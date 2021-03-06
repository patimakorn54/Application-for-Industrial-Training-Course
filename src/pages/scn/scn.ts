import { Component, Input } from '@angular/core';
import { NavController, NavParams, AlertController, ActionSheetController, ToastController, Platform, LoadingController, Loading  } from 'ionic-angular';
import { Camera, File, Transfer, FilePath } from 'ionic-native';
import { Http, Headers } from '@angular/http';
/*
  Generated class for the Scn page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  selector: 'page-scn',
  templateUrl: 'scn.html'
})
export class ScnPage {
  items:any;
  userdata: any;
  hostname:string;
  show: boolean = true;
  list=[];
  errorMessage: string;
  temp= "assets/image/Default.png";

  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController, public actionSheetCtrl: ActionSheetController,
    public http: Http, private toastCtrl: ToastController, public platform: Platform, public loadingCtrl: LoadingController) {
      this.userdata = JSON.parse(localStorage.getItem("userdata"));
      this.http = http;
      this.http.get("assets/server.json")
          .subscribe(data =>{
          this.items = JSON.parse(data['_body']);//get ip from server.json
          this.hostname = this.items.ip; //put ip into hostname
          },error=>{
              console.log(error);// Error getting the data
          } );
  }

  presentToast(text) {
  let toast = this.toastCtrl.create({
    message: text,
    duration: 3000,
    position: 'bottom'
  });
  toast.present();
  }

  @Input() CompanyName;
  @Input() CompanyAddress;
  @Input() CompanyTel;
  sendData(){
    let list = this.list;
    if( list == null || list.length == 0 ||
        this.CompanyName == null || this.CompanyName.trim()=="" ||
        this.CompanyAddress == null || this.CompanyAddress.trim()=="" ||
        this.CompanyTel == null || this.CompanyTel.trim()==""){
          let alert = this.alertCtrl.create({
            title: 'Submit Failed',
            subTitle: 'please fill all required fields!',
            buttons: ['OK']
          });
          alert.present();
        } else {
          let body = `id=${this.userdata.id}&CompanyName=${this.CompanyName}&CompanyAddress=${this.CompanyAddress}&CompanyTel=${this.CompanyTel}`;
          let headers = new Headers();
          headers.append('Content-Type', 'application/x-www-form-urlencoded');
          for (let list of this.list){
            body += `&list[]=${list.id}`;
          }
          this.http.post(this.hostname + 'sent-company', body, {headers: headers})
            .subscribe(
              data => {

              },
              error =>  this.errorMessage = <any>error
            )
            console.log(body);
            this.presentToast('Successfull');
            this.CompanyName = "";
            this.CompanyAddress = "";
            this.CompanyTel = "";
            this.list=[];
            this.updateValue();
        }
  }

 updateValue(){
   if(this.list.length==0){
     this.show=true
   }
   else{
     this.show=false
   }
 }


 showPrompt() {
   let prompt = this.alertCtrl.create({
     message: "Enter student's name that want to go to this company",
     inputs: [
       {
         name: 'id',
         placeholder: "Student ID",
         type: 'tel'
       },
       {
         name: 'name',
         placeholder: "Student's Name",
         type: 'text'
       }
     ],
     buttons: [
       {
         text: 'Cancel',
         handler: data => {
           console.log('Cancel clicked');
         }
       },
       {
         text: 'Save',
         handler: data => {
           console.log('Saved clicked');
           if(data.id.trim() != "" && data.name.trim() != ""){
             this.list.push({id: data.id, name: data.name}); //เดี๋ยวต้องดึง Major จากเบสมาใส่ด้วย
             this.updateValue();
         }
           console.log(this.list);
         }
       }
     ]
   });
   prompt.present();
 }

 getPicture() {
   let options = {
     destinationType   : Camera.DestinationType.DATA_URL,
     sourceType        : Camera.PictureSourceType.PHOTOLIBRARY,
     correctOrientation: true
   };

   Camera.getPicture(options).then((imageData) => {
    let base64Image = "data:image/jpeg;base64," + imageData;
    this.temp = base64Image;
   }, (err) => {
 });
 }


  presentActionSheet(i) {
    let actionSheet = this.actionSheetCtrl.create({
      title: 'Option',
      buttons: [
        {
          text: 'Edit',
          handler: data => {
            this.edit(i);
          }
        },
        {
          text: 'Delete',
          handler: () => {
            let remove = this.alertCtrl.create({
              title: 'Delete your list?',
              message: 'Do you want to delete your list?',
              buttons: [
                {
                  text: 'No',
                  handler: () => {
                    console.log('No clicked');
                  }
                },
                {
                  text: 'Yes',
                  handler: () => {
                    this.list.splice(i,1);
                    this.updateValue();
                  }
                }
              ]
            })
            remove.present();
          }
        },
        {
          text: 'Clear',
          handler: () => {
            let clear = this.alertCtrl.create({
              title: 'Clear your list?',
              message: 'Do you want to clear your list?',
              buttons: [
                {
                  text: 'No',
                  handler: () => {
                    console.log('No clicked');
                  }
                },
                {
                  text: 'Yes',
                  handler: () => {
                    this.list = [];
                    this.updateValue();
                  }
                }
              ]
            })
            clear.present();
          }
        }
      ]
    });
    actionSheet.present();
  }

  edit(i){
    let prompt = this.alertCtrl.create({
      message: "Edit your informations",
      inputs: [
        {
          name: 'id',
          value: this.list[i].id,
          placeholder: "Student ID",
          type: 'tel'
        },
        {
          name: 'name',
          value: this.list[i].name,
          placeholder: "Student's Name",
          type: 'text'
        }
      ],
      buttons: [
        {
          text: 'Cancel',
          handler: data => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Edit',
          handler: data => {
            console.log('Saved clicked');
            if(data.id.trim() != "" && data.name.trim() != ""){
              this.list[i] = {id: data.id, name: data.name};
              this.updateValue();
          }
            console.log(this.list);
          }
        }
      ]
    });
    prompt.present();
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ScnPage');
    this.updateValue();
  }

}
