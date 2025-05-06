import * as React from 'react';
import { IWellcomeProps } from './IWellcomeProps';
import { IWellcomeState } from './IWellcomeState';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';
import styles from './Wellcome.module.scss';

export default class Wellcome extends React.Component<IWellcomeProps, IWellcomeState> {
  private defaultBackgroundImage: string = `${this.props.context.pageContext.web.absoluteUrl}/SiteAssets/welcome-background-gray.jpg`;

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
          userPhoto: `${this.props.context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?accountname=${user.Email}&size=L`,
          loading: false
        });
      })
      .catch((error: any): void => {
        console.error('Erro ao obter informações do usuário:', error);
        this.setState({
          loading: false,
        });
      });
  }

  public render(): React.ReactElement<IWellcomeProps> {
    const { userName, userPhoto, loading } = this.state;
    const backgroundImage = this.props.backgroundImageUrl || this.defaultBackgroundImage;

    return (
      <div 
        className={styles.wellcome}
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        {loading ? (
          <div className={styles.container}>
            <div className={styles.userInfo}>
              <Shimmer
                width={120}
                height={120}
                shimmerElements={[
                  { type: ShimmerElementType.circle, height: 120, width: 120 }
                ]}
              />
              <div>
                <Shimmer
                  width={200}
                  shimmerElements={[
                    { type: ShimmerElementType.line, height: 20, width: 100 },
                    { type: ShimmerElementType.line, height: 24, width: 200 }
                  ]}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.container}>
            <div className={styles.userInfo}>
              <img 
                src={userPhoto} 
                alt={userName} 
                className={styles.userPhoto}
              />
              <div>
                <span className={styles.welcomeText}>Bem-vindo,</span>
                <span className={styles.userName}>{userName}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
