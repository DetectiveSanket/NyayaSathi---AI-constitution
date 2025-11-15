import "./styles/shiny-card.css";
const ShinyCard = ({ featureName, featureDescription, icon }) => {
  return (
    <div className="shiny-card flex flex-col items-center justify-center min-h-72 shadow-2xl dark:shadow-none border border-[#00ccff] rounded-2xl p-6 transition-transform duration-00 hover:scale-105">
      <div className="flex items-center justify-center mb-4 w-14 h-14 rounded-xl group hover:scale-125 hover:rotate-12 transition-all duration-500">
        {icon}
      </div>
      <h2 className="text-xl font-bold text-center mb-2 group-hover:text-accent transition-colors duration-300">
        {featureName}
      </h2>
      <p className="text-text-secondary text-sm leading-relaxed text-center">
        {featureDescription}
      </p>
    </div>
  );
};
export default ShinyCard;