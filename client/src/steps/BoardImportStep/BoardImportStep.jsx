// import PropTypes from 'prop-types';
// import { useTranslation } from 'react-i18next';

// import styles from './BoardImportStep.module.scss';

// const ImportBoardStep = React.memo(({ onSelect, onBack }) => {
//   const [t] = useTranslation();
//   const handleFileSelect = useCallback(
//     (type, file) => {
//       onSelect({
//         type,
//         file,
//       });
//       onBack();
//     },
//     [onSelect, onBack],
//   );
//   return (
//     <>
//       <PopoverHeader onBack={onBack} title={t('common.importBoard', {
//         context: 'title',
//       })} />
//         <FilePicker onSelect={(file) => handleFileSelect('trello', file)} accept=".json">
//           <Button
//             fluid
//             type="button"
//             icon="trello"
//             content={t('common.fromTrello')}
//             className={styles.button}
//           />
//         </FilePicker>
//     </>
//   );
// });

// ImportBoardStep.propTypes = {
//   onSelect: PropTypes.func.isRequired,
//   onBack: PropTypes.func.isRequired,
// };

// export default ImportBoardStep;
