import {Component, inject, OnInit} from '@angular/core';
import {MazoApiService, SaveMazoRequest} from "../../../api/mazo-api/mazo-api.service";
import {Router} from "@angular/router";
import {FormBuilder, Validators} from "@angular/forms";
import {UserApiService} from "../../../api/user-api/user-api.service";
//import {DialogApiService} from "../../../api/dialog-api/dialog-api.service";

@Component({
  selector: 'app-crearmazo',
  templateUrl: './crearmazo.component.html',
  styleUrls: ['./crearmazo.component.css']
})
export class CrearmazoComponent implements OnInit{
//Identificador de usuario logeado
  userLoginOn: boolean = false;

  //Identificador de que usuario se ha logeado
  usuarioLogeado: any = {};

  //Modelo del objeto a ser creado
  mazo: SaveMazoRequest = {
    titulo: '',
    descripcion: '',
    imagen: '',
    username: ''
  };

  //En caso salga algun error
  formError: String = "";
  errorData: String = "";

  //Inyecciones
  router = inject(Router);
  formBuilder = inject(FormBuilder);
  userApiService = inject(UserApiService);
  mazoApiService = inject(MazoApiService);
  //dialogApiService = inject(DialogApiService);

  //Validaciones del formulario
  createMazoForm = this.formBuilder.group({
    titulo: ['', [Validators.required, Validators.maxLength(30)]],
    descripcion: ['', Validators.maxLength(200)],
    imagen: ['', Validators.required]
  })

  ngOnInit() {
    this.userApiService.currentUserLoginOn.subscribe({
      next: (userLoginOn) => {
        this.userLoginOn = userLoginOn;
      }
    })
    let token = this.userApiService.userToken;
    this.usuarioLogeado = this.decodificarjwt(token);
    console.log(this.usuarioLogeado);
    this.mazo.username = this.usuarioLogeado.sub as string;
  }


  //Para desencriptar el token
  private decodificarjwt(token: String): any {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    console.log("JSON: " + jsonPayload);
    return JSON.parse(jsonPayload);
  }

  //Para acceder mas facil a los controles de la validacion del formulario
  get title() {
    return this.createMazoForm.controls.titulo;
  }

  get descripcion() {
    return this.createMazoForm.controls.descripcion;
  }

  get imagen() {
    return this.createMazoForm.controls.imagen;
  }

  //Funcion de crear Mazo
  saveMazo() {
    console.log(this.mazo)
    if (this.createMazoForm.valid) {
      console.log("Estado del formulario:", this.createMazoForm.value);
      this.formError = "";
      console.log("Este es mi mazo: "+this.mazo);
      this.mazoApiService.saveMazo(this.mazo).subscribe({
        next: (mazoData) => {
          console.log(mazoData)
        },
        error: (errorData: any) => {
          console.error(errorData);
          this.formError = "Error al crear";
        },
        complete: () => {
          console.info("Creacion completada");
    //      this.dialogApiService.openDialogCustom();
          this.createMazoForm.reset();
        }
      });
    } else {
      this.createMazoForm.markAllAsTouched();
      alert("Error de ingreso de datos")
    }
  }

  //Conversion de la imagen a Base64
  handleImageSelect(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files[0]) {
      const imageFile = inputElement.files[0];
      this.convertImageToBase64(imageFile, (base64String) => {
        this.mazo.imagen = base64String as string;
      });
    }
  }

  convertImageToBase64(file: File, callback: (base64String: string) => void) {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      callback(base64String);
    };
    reader.readAsDataURL(file);
  }

  tieneAcceso(): boolean {
    return this.userLoginOn;
  }
}