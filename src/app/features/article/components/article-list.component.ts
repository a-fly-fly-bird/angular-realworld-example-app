import { NgClass, NgForOf, NgIf } from "@angular/common";
import { Component, DestroyRef, Input, inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { LoadingState } from "../../../core/models/loading-state.model";
import { ArticleListConfig } from "../models/article-list-config.model";
import { Article } from "../models/article.model";
import { ArticlesService } from "../services/articles.service";
import { ArticlePreviewComponent } from "./article-preview.component";

@Component({
  selector: "app-article-list",
  template: `
    @if (loading === LoadingState.LOADING) {
      <div class="article-preview">Loading articles...</div>
    }

    @if (loading === LoadingState.LOADED) {
      @for (article of results; track article.slug) {
        <app-article-preview [article]="article" />
      } @empty {
        <div class="article-preview">No articles are here... yet.</div>
      }

      <nav>
        <ul class="pagination">
          @for (pageNumber of totalPages; track pageNumber) {
            <li
              class="page-item"
              [ngClass]="{ active: pageNumber === currentPage }"
            >
              <button class="page-link" (click)="setPageTo(pageNumber)">
                {{ pageNumber }}
              </button>
            </li>
          }
        </ul>
      </nav>
    }
  `,
  imports: [ArticlePreviewComponent, NgForOf, NgClass, NgIf],
  styles: `
    .page-link {
      cursor: pointer;
    }
  `,
  standalone: true,
})
export class ArticleListComponent {
  query!: ArticleListConfig;
  results: Article[] = [];
  currentPage = 1;
  totalPages: Array<number> = [];
  loading = LoadingState.NOT_LOADED;
  LoadingState = LoadingState;
  destroyRef = inject(DestroyRef);

  @Input() limit!: number;

  // 直接在@Input()接set, 这样输入就会作为参数
  @Input()
  set config(config: ArticleListConfig) {
    if (config) {
      this.query = config;
      this.currentPage = 1;
      this.runQuery();
    }
  }

  constructor(private articlesService: ArticlesService) {}

  setPageTo(pageNumber: number) {
    this.currentPage = pageNumber;
    this.runQuery();
  }

  runQuery() {
    this.loading = LoadingState.LOADING;
    this.results = [];

    // Create limit and offset filter (if necessary)
    if (this.limit) {
      this.query.filters.limit = this.limit;
      this.query.filters.offset = this.limit * (this.currentPage - 1);
    }

    this.articlesService
      .query(this.query)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => {
        this.loading = LoadingState.LOADED;
        this.results = data.articles;

        // Used from http://www.jstips.co/en/create-range-0...n-easily-using-one-line/
        // https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/from
        // Array.from 可以从一个可迭代的对象中创造一个新数组，下面这段代码的意思是：新建一个页数长度的数组，然后迭代这个数组，获得index, 所以最后得到的数组值就是从1到页数
        this.totalPages = Array.from(
          new Array(Math.ceil(data.articlesCount / this.limit)),
          (val, index) => index + 1,
        );
      });
  }
}
