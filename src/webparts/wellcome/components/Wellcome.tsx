import * as React from 'react';
import { IWellcomeProps } from './IWellcomeProps';
import { IWellcomeState } from './IWellcomeState';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import styles from './Wellcome.module.scss';

export default class Wellcome extends React.Component<IWellcomeProps, IWellcomeState> {
  constructor(props: IWellcomeProps) {
    super(props);
    this.state = {
      userName: '',
      userPhoto: '',
      loading: true
    };
  }

  public componentDidMount(): void {
    this._getCurrentUser();
  }

  private _getCurrentUser(): void {
    this.props.context.spHttpClient.get(
      `${this.props.context.pageContext.web.absoluteUrl}/_api/web/currentuser`,
      SPHttpClient.configurations.v1,
      {
        headers: {
          'Accept': 'application/json;odata=nometadata',
          'odata-version': ''
        }
      }
    )
      .then((response: SPHttpClientResponse): Promise<any> => {
        return response.json();
      })
      .then((user: any): void => {
        this.setState({
          userName: user.Title,
          loading: false
        });
        this._getUserPhoto(user.Email);
      });
  }

  private _getUserPhoto(email: string): void {
    const photoUrl = `https://outlook.office365.com/owa/service.svc/s/GetPersonaPhoto?email=${email}&UA=0&size=HR96x96`;
    this.setState({
      userPhoto: photoUrl
    });
  }

  public render(): React.ReactElement<IWellcomeProps> {
    const { userName, userPhoto, loading } = this.state;

    return (
      <div className={styles.wellcome}>
        {loading ? (
          <div>Carregando...</div>
        ) : (
          <div className={styles.container}>
            <div className={styles.userInfo}>
              <img src={userPhoto} alt={userName} className={styles.userPhoto} />
              <h2>Bem-vindo(a), {userName}!</h2>
            </div>
          </div>
        )}
      </div>
    );
  }
}
