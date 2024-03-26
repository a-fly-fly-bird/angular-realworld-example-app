import { AsyncPipe, NgClass, NgForOf } from "@angular/common";
import { Component, DestroyRef, OnInit, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { RxLet } from "@rx-angular/template/let";
import { tap } from "rxjs/operators";
import { IfAuthenticatedDirective } from "../../../../core/auth/if-authenticated.directive";
import { UserService } from "../../../../core/auth/services/user.service";
import { ArticleListComponent } from "../../components/article-list.component";
import { ArticleListConfig } from "../../models/article-list-config.model";
import { TagsService } from "../../services/tags.service";

@Component({
  selector: "app-home-page",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.css"],
  imports: [
    NgClass,
    ArticleListComponent,
    AsyncPipe,
    RxLet,
    NgForOf,
    IfAuthenticatedDirective,
  ],
  standalone: true,
})
export default class HomeComponent implements OnInit {
  isAuthenticated = false;
  listConfig: ArticleListConfig = {
    type: "all",
    filters: {},
  };
  tags$ = inject(TagsService)
    .getAll()
    .pipe(tap(() => (this.tagsLoaded = true)));
  tagsLoaded = false;
  destroyRef = inject(DestroyRef);

  constructor(
    // 与 const 相比， readonly 具有更大的灵活性，因为它允许在构造函数中设置属性的初始值。
    private readonly router: Router,
    private readonly userService: UserService,
  ) {}

  ngOnInit(): void {
    // 如果一开始没有token,那么就this.userService.isAuthenticated就是false
    this.userService.isAuthenticated
      .pipe(
        tap((isAuthenticated) => {
          if (isAuthenticated) {
            this.setListTo("feed");
          } else {
            this.setListTo("all");
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(
        (isAuthenticated: boolean) => (this.isAuthenticated = isAuthenticated),
      );
  }

  setListTo(type: string = "", filters: Object = {}): void {
    // If feed is requested but user is not authenticated, redirect to login
    if (type === "feed" && !this.isAuthenticated) {
      void this.router.navigate(["/login"]);
      return;
    }

    // Otherwise, set the list object
    // 直接换引用地址了，所以变更检测能检测到
    this.listConfig = { type: type, filters: filters };
  }
}
