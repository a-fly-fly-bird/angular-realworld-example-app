import { AsyncPipe, NgIf } from "@angular/common";
import { Component, inject } from "@angular/core";
import { RouterLink, RouterLinkActive } from "@angular/router";
import { IfAuthenticatedDirective } from "../auth/if-authenticated.directive";
import { UserService } from "../auth/services/user.service";

@Component({
  selector: "app-layout-header",
  templateUrl: "./header.component.html",
  imports: [
    RouterLinkActive,
    RouterLink,
    AsyncPipe,
    NgIf,
    IfAuthenticatedDirective,
  ],
  standalone: true,
})
export class HeaderComponent {
  currentUser$ = inject(UserService).currentUser;
}
