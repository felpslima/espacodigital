import * as React from 'react';
import { IAnnouncementsProps } from './IAnnouncementsProps';
import { IAnnouncementsState } from './IAnnouncementsState';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';
import { Shimmer, ShimmerElementType } from '@fluentui/react/lib/Shimmer';
import styles from './Announcements.module.scss';

export default class Announcements extends React.Component<IAnnouncementsProps, IAnnouncementsState> {
  constructor(props: IAnnouncementsProps) {
    super(props);
    this.state = {
      announcement: null,
      isLoading: true
    };
  }

  public componentDidMount(): void {
    this._getAnnouncement();
  }

  private _getAnnouncement(): void {
    const currentDate = new Date().toISOString();

    this.props.context.spHttpClient.get(
      `${this.props.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('Avisos')/items?$filter=datainicio le '${currentDate}' and datafim ge '${currentDate}'&$orderby=datainicio desc&$top=1`,
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
      .then((data: any): void => {
        this.setState({
          announcement: data.value.length > 0 ? data.value[0] : null,
          isLoading: false
        });
      })
      .catch((error: any): void => {
        console.error('Erro ao obter avisos:', error);
        this.setState({ isLoading: false });
      });
  }

  private renderShimmer(): JSX.Element {
    return (
      <div className={styles.announcements}>
        <div className={styles.container}>
          <Shimmer
            width="100%"
            shimmerElements={[
              { type: ShimmerElementType.line, height: 40 }
            ]}
          />
        </div>
      </div>
    );
  }

  public render(): React.ReactElement<IAnnouncementsProps> | null {
    const { announcement, isLoading } = this.state;

    if (isLoading) {
      return this.renderShimmer();
    }

    if (!announcement) {
      return null;
    }

    return (
      <div className={styles.announcements}>
        <div className={styles.container}>
          <div className={styles.announcementText}>
            {announcement.Title}
          </div>
        </div>
      </div>
    );
  }
} 