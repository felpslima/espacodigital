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
  private containerRef: React.RefObject<HTMLDivElement>;
  private itemWidth: number = 200;

  constructor(props: IWellcomeProps) {
    super(props);
    this.containerRef = React.createRef();
    this.state = {
      userName: '',
      userPhoto: '',
      favorites: [],
      isLoading: true,
      containerWidth: 0
    };
  }

  public async componentDidMount(): Promise<void> {
    await Promise.all([
      this._getCurrentUser(),
      this._loadFavorites()
    ]);
    this._measureContainer();
    window.addEventListener('resize', this._measureContainer);
  }

  public componentWillUnmount(): void {
    window.removeEventListener('resize', this._measureContainer);
  }

  private _measureContainer = (): void => {
    if (this.containerRef.current) {
      this.setState({ containerWidth: this.containerRef.current.offsetWidth });
    }
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
      const response = await this.props.context.spHttpClient.get(
        `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Favoritos')/items?$select=ID,Title,Link,Icone,Ordem&$orderby=Ordem desc`,
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
        
        const formattedFavorites = data.value.map((item: any) => {
          let iconUrl = '';
          try {
            if (item.Icone) {
              const iconData = JSON.parse(item.Icone);
              iconUrl = `${this.props.context.pageContext.web.absoluteUrl}/Lists/Favoritos/Attachments/${item.ID}/${iconData.fileName}`;
            }
          } catch (error) {
            console.error('Erro ao processar ícone:', error);
          }

          return {
            Title: item.Title || '',
            Link: item.Link || '',
            Icone: iconUrl || 'Link',
            Ordem: item.Ordem || 0
          };
        });

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
    return (
      <div className={styles.carouselItem}>
        <a href={item.Link} className={styles.quickLinkButton} target="_blank" rel="noopener noreferrer">
          {item.Icone && item.Icone !== 'Link' ? (
            <img src={item.Icone} alt={item.Title} className={styles.quickLinkIcon} />
          ) : (
            <Icon iconName="Link" className={styles.quickLinkIcon} />
          )}
          <span>{item.Title}</span>
        </a>
      </div>
    );
  }

  private groupFavoritesIntoSlides(favorites: IFavoriteItem[]): IFavoriteItem[][] {
    const { containerWidth } = this.state;
    
    if (!favorites.length || !containerWidth) {
      return [];
    }

    const itemsPerSlide = Math.max(1, Math.floor(containerWidth / this.itemWidth));
    
    if (itemsPerSlide >= favorites.length) {
      return [favorites];
    }
    
    const slides: IFavoriteItem[][] = [];
    for (let i = 0; i < favorites.length; i += itemsPerSlide) {
      const slideItems = favorites.slice(i, i + itemsPerSlide);
      if (slideItems.length > 0) {
        slides.push(slideItems);
      }
    }
    
    return slides;
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
    const backgroundStyle = this.props.backgroundImageUrl 
      ? {
          backgroundImage: `url('${this.props.backgroundImageUrl}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }
      : {
          backgroundColor: '#0060A1'
        };

    const slides = this.groupFavoritesIntoSlides(favorites);
    const showCarousel = slides.length > 1;

    return (
      <div 
        className={styles.wellcome}
        style={backgroundStyle}
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
            <div className={styles.rightSection} ref={this.containerRef}>
              {favorites && favorites.length > 0 ? (
                showCarousel ? (
                  <Carousel
                    element={slides.map((slideItems, index) => (
                      <div key={index} className={styles.carouselSlide}>
                        {slideItems.map((item, itemIndex) => this.renderCarouselItem(item))}
                      </div>
                    ))}
                    buttonsLocation={CarouselButtonsLocation.center}
                    buttonsDisplay={CarouselButtonsDisplay.buttonsOnly}
                    contentContainerStyles={styles.carouselContainer}
                    isInfinite={false}
                    pauseOnHover={true}
                    containerButtonsStyles={styles.carouselButtons}
                    indicatorShape={CarouselIndicatorShape.square}
                    indicators={false}
                    interval={999999}
                  />
                ) : (
                  <div className={styles.carouselSlide}>
                    {favorites.map((item, index) => this.renderCarouselItem(item))}
                  </div>
                )
              ) : (
                <div>Nenhum favorito adicionado</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }
}
