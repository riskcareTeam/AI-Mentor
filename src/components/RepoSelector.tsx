import { useUser } from '../context/userContext';

const RepoSelector = () => {
      const {  user, setUserData } = useUser();
      const repos = user?.repos ?? []
    

      const onRepoChange = (e: any) => {
        if(!user?.login) return;

        setUserData({...user, selectedRepo: e.target.value})
      }
    return (
        <select onChange={(e: any) => onRepoChange(e)}>
            <option>Select a repository</option>
            {repos.map((repo: any) => (
                <option key={repo.repoName
                } value={repo.repoName}>
                    {repo.repoName}
                </option>
            ))}
        </select>
    )
}
export default RepoSelector;