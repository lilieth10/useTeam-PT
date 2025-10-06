export const initialState = {
  boards: [],
  columns: [],
  cards: [],
  activeBoardId: null,
  loading: false,
  exporting: false,
  error: null
};

export const kanbanReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };

    case 'SET_EXPORTING':
      return {
        ...state,
        exporting: action.payload
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };

    // Board actions
    case 'SET_BOARDS':
      return {
        ...state,
        boards: action.payload
      };

    case 'SET_ACTIVE_BOARD':
      return {
        ...state,
        activeBoardId: action.payload
      };

    case 'ADD_BOARD':
      return {
        ...state,
        boards: [...state.boards, action.payload]
      };

    case 'UPDATE_BOARD':
      return {
        ...state,
        boards: state.boards.map(board =>
          board._id === action.payload._id ? action.payload : board
        )
      };

    case 'DELETE_BOARD':
      return {
        ...state,
        boards: state.boards.filter(board => board._id !== action.payload),
        activeBoardId: state.activeBoardId === action.payload ? null : state.activeBoardId
      };

    // Column actions
    case 'SET_COLUMNS':
      return {
        ...state,
        columns: action.payload
      };

    case 'ADD_COLUMN':
      return {
        ...state,
        columns: [...state.columns, action.payload]
      };

    case 'UPDATE_COLUMN':
      return {
        ...state,
        columns: state.columns.map(column =>
          column._id === action.payload._id ? action.payload : column
        )
      };

    case 'DELETE_COLUMN':
      return {
        ...state,
        columns: state.columns.filter(column => column._id !== action.payload),
        cards: state.cards.filter(card => card.columnId !== action.payload)
      };

    // Card actions
    case 'SET_CARDS':
      return {
        ...state,
        cards: action.payload
      };

    case 'ADD_CARD':
      return {
        ...state,
        cards: [...state.cards, action.payload]
      };

    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map(card =>
          card._id === action.payload._id ? action.payload : card
        )
      };

    case 'MOVE_CARD':
      return {
        ...state,
        cards: state.cards.map(card =>
          card._id === action.payload._id ? action.payload : card
        )
      };

    case 'DELETE_CARD':
      return {
        ...state,
        cards: state.cards.filter(card => card._id !== action.payload)
      };

    // WebSocket real-time updates
    case 'CARD_CREATED':
      // Evitar duplicados
      if (state.cards.find(card => card._id === action.payload._id)) {
        return state;
      }
      return {
        ...state,
        cards: [...state.cards, action.payload]
      };

    case 'CARD_UPDATED':
      return {
        ...state,
        cards: state.cards.map(card =>
          card._id === action.payload._id ? action.payload : card
        )
      };

    case 'CARD_DELETED':
      return {
        ...state,
        cards: state.cards.filter(card => card._id !== action.payload)
      };

    case 'CARD_MOVED':
      return {
        ...state,
        cards: state.cards.map(card =>
          card._id === action.payload._id ? action.payload : card
        )
      };

    case 'COLUMN_CREATED':
      if (state.columns.find(column => column._id === action.payload._id)) {
        return state;
      }
      return {
        ...state,
        columns: [...state.columns, action.payload]
      };

    case 'COLUMN_UPDATED':
      return {
        ...state,
        columns: state.columns.map(column =>
          column._id === action.payload._id ? action.payload : column
        )
      };

    default:
      return state;
  }
};
