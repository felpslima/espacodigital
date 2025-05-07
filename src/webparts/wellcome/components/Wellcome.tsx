import * as React from 'react';
import styles from './Wellcome.module.scss';
import { IWellcomeProps } from './IWellcomeProps';
import { IWellcomeState } from './IWellcomeState';
import { IFavoriteItem } from './IFavoriteItem';
import { Carousel, CarouselButtonsLocation, CarouselButtonsDisplay, CarouselIndicatorShape } from '@pnp/spfx-controls-react/lib/Carousel';
import { Icon } from '@fluentui/react/lib/Icon';
import { SPHttpClient } from '@microsoft/sp-http';
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';

export default class Wellcome extends React.Component<IWellcomeProps, IWellcomeState> {
  private defaultBackgroundImage: string = `${this.props.context.pageContext.web.absoluteUrl}/SiteAssets/welcome-background.jpg`;

  constructor(props: IWellcomeProps) {
    super(props);
    this.state = {
      userName: '',
      userPhoto: '',
      favorites: [],
      isLoading: true
    };
  }

  public async componentDidMount(): Promise<void> {
    await Promise.all([
      this._getCurrentUser(),
      this._loadFavorites()
    ]);
  }

  private async _getCurrentUser(): Promise<void> {
    try {
      const response = await this.props.context.spHttpClient.get(
        `${this.props.context.pageContext.web.absoluteUrl}/_api/web/currentuser`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'odata-version': ''
          }
        }
      );

      if (response.ok) {
        const user = await response.json();
        this.setState({
          userName: user.Title,
          userPhoto: `${this.props.context.pageContext.web.absoluteUrl}/_layouts/15/userphoto.aspx?accountname=${user.Email}&size=L`
        });
      }
    } catch (error) {
      console.error('Erro ao obter informações do usuário:', error);
    }
  }

  private async _loadFavorites(): Promise<void> {
    try {
      console.log('Iniciando carregamento dos favoritos...');
      const response = await this.props.context.spHttpClient.get(
        `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Favoritos')/items`,
        SPHttpClient.configurations.v1,
        {
          headers: {
            'Accept': 'application/json;odata=nometadata',
            'odata-version': ''
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Resposta da API:', data);
        console.log('Número de favoritos carregados:', data.value ? data.value.length : 0);
        
        const formattedFavorites = data.value.map((item: any) => ({
          Title: item.Title || '',
          Link: item.Link || '',
          Icon: item.Icon || 'Link'
        }));

        this.setState({
          favorites: formattedFavorites,
          isLoading: false
        });
      } else {
        console.error('Erro na resposta da API:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      this.setState({ isLoading: false });
    }
  }

  private renderCarouselItem(item: IFavoriteItem): JSX.Element {
    console.log('Renderizando item do carrossel:', item);
    return (
      <div className={styles.carouselItem}>
        <a href={item.Link} className={styles.quickLinkButton} target="_blank" rel="noopener noreferrer">
          <Icon iconName={item.Icon || 'Link'} className={styles.quickLinkIcon} />
          <span>{item.Title}</span>
        </a>
      </div>
    );
  }

  private renderShimmer(): JSX.Element {
    return (
      <div className={styles.container}>
        <div className={styles.leftSection}>
          <div className={styles.userInfo}>
            <Shimmer
              width={100}
              height={100}
              shimmerElements={[
                { type: ShimmerElementType.circle, height: 100, width: 100 }
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
        <div className={styles.rightSection}>
          <Shimmer
            width={300}
            height={150}
            shimmerElements={[
              { type: ShimmerElementType.line, height: 150, width: 300 }
            ]}
          />
        </div>
      </div>
    );
  }

  public render(): React.ReactElement<IWellcomeProps> {
    const { userName, userPhoto, favorites, isLoading } = this.state;
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
        {isLoading ? (
          this.renderShimmer()
        ) : (
          <div className={styles.container}>
            <div className={styles.leftSection}>
              <div className={styles.userInfo}>
                <img 
                  src={userPhoto} 
                  alt={userName} 
                  className={styles.userPhoto}
                />
                <div>
                  <div className={styles.welcomeText}>Bem-vindo,</div>
                  <div className={styles.userName}>{userName}</div>
                </div>
              </div>
            </div>
            <div className={styles.rightSection}>
              {favorites && favorites.length > 0 ? (
                <Carousel
                  element={favorites.map((item, index) => (
                    <div key={index} className={styles.carouselSlide}>
                      {this.renderCarouselItem(item)}
                    </div>
                  ))}
                  buttonsLocation={CarouselButtonsLocation.center}
                  buttonsDisplay={CarouselButtonsDisplay.buttonsOnly}
                  contentContainerStyles={styles.carouselContainer}
                  isInfinite={true}
                  pauseOnHover={true}
                  containerButtonsStyles={styles.carouselButtons}
                  indicatorShape={CarouselIndicatorShape.square}
                  indicators={false}
                />
              ) : (
                <div>Nenhum favorito encontrado</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
