import { connect } from 'react-redux';
//import { addProtein, removeProtein, updateProtein, moveProtein } from '../actions';
import Data from '../components/Data';

const mapStateToProps = (state) => {
  return {
    proteins: state.resources.proteins,
    species: state.resources.species,
    genomes: state.resources.genomes,
    index: state.resources.index,
    systemiceffects: state.resources.systemiceffects
  };
};

// const mapDispatchToProps = (dispatch) => {
//   return {
//     onAddProtein: (protein) => dispatch(addProtein(protein)),
//     onRemoveProtein: (id) => dispatch(removeProtein(id)),
//     updateProtein: (id, updates) =>
//       dispatch(updateProtein(id, updates)),
//     moveProtein: (dragIndex, hoverIndex, protein) =>
//       dispatch(moveProtein(dragIndex, hoverIndex, protein)),
//   };
// };

const DataContainer = connect(
  mapStateToProps,
//   mapDispatchToProps
)(Data);

export default DataContainer;
