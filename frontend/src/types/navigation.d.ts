export type RootStackParamList = {
  Auth: undefined;
  Home: undefined;
  Analysis: { analysisId: string };
  Education: undefined;
  Profile: undefined;
  Settings: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
