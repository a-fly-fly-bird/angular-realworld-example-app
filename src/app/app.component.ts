import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";
import { FooterComponent } from "./core/layout/footer.component";
import { HeaderComponent } from "./core/layout/header.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  standalone: true,
  imports: [HeaderComponent, RouterOutlet, FooterComponent],
})
export class AppComponent {}
