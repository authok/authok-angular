import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { AuthService } from 'projects/authok-angular/src/lib/auth.service';
import { iif } from 'rxjs';
import { first } from 'rxjs/operators';
import { LogoutOptions } from '@authok/authok-spa-js';
import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isAuthenticated$ = this.auth.isAuthenticated$;
  isLoading$ = this.auth.isLoading$;
  user$ = this.auth.user$;
  claims$ = this.auth.idTokenClaims$;
  accessToken = '';
  appStateResult = '';
  error$ = this.auth.error$;

  organization = '';

  loginOptionsForm = new FormGroup({
    appStateInput: new FormControl(''),
    usePopup: new FormControl(false),
  });

  logoutOptionsForm = new FormGroup({
    localOnly: new FormControl(false),
    federated: new FormControl(false),
  });

  accessTokenOptionsForm = new FormGroup({
    usePopup: new FormControl(false),
    ignoreCache: new FormControl(false),
  });

  ngOnInit(): void {
    this.auth.appState$.subscribe((appState) => {
      this.appStateResult = appState.myValue;
    });
  }

  constructor(
    public auth: AuthService,
    @Inject(DOCUMENT) private doc: Document,
    private httpClient: HttpClient
  ) {}

  launchLogin(): void {
    const usePopup = this.loginOptionsForm.value.usePopup === true;
    if (usePopup) {
      this.auth.loginWithPopup({
        ...(this.organization ? { organization: this.organization } : null),
      });
    } else {
      this.auth.loginWithRedirect({
        ...(this.organization ? { organization: this.organization } : null),
        appState: {
          myValue: this.loginOptionsForm.value.appStateInput,
        },
      });
    }
  }

  loginHandleInvitationUrl(): void {
    const url = prompt('Your invitation URL');

    if (url) {
      const inviteMatches = url.match(/invitation=([a-zA-Z0-9_]+)/);
      const orgMatches = url.match(/organization=([a-zA-Z0-9_]+)/);

      if (orgMatches && inviteMatches) {
        this.auth.loginWithRedirect({
          organization: orgMatches[1],
          invitation: inviteMatches[1],
        });
      } else if (orgMatches) {
        this.auth.loginWithRedirect({
          organization: orgMatches[1],
        });
      }
    }
  }

  launchLogout(): void {
    const formOptions = this.logoutOptionsForm.value;
    const options: LogoutOptions = {
      localOnly: formOptions.localOnly === true,
      federated: formOptions.federated === true,
      returnTo: this.doc.location.origin,
    };

    this.auth.logout(options);
  }

  updateAccessToken(): void {
    const usePopup = this.accessTokenOptionsForm.value.usePopup === true;
    const ignoreCache = this.accessTokenOptionsForm.value.ignoreCache === true;
    iif(
      () => usePopup,
      this.auth.getAccessTokenWithPopup(),
      this.auth.getAccessTokenSilently({ ignoreCache })
    )
      .pipe(first())
      .subscribe((token) => {
        this.accessToken = token;
      });
  }

  callExternalAPI(): void {
    this.httpClient
      .get('http://localhost:3001/api/external')
      .subscribe(console.log, console.error);
  }
}
