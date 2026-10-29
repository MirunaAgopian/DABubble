export type OverlayView =
  | 'profile'
  | 'edit-profile'
  | 'logout'
  | 'create-channel'
  | 'user-profile'
  | 'add-members'
  | 'channel-details'
  | 'header-add-members-primary'
  | 'header-add-members-secondary';

export interface OverlayTrigger {
  view: OverlayView;
  anchor: DOMRect;
}
