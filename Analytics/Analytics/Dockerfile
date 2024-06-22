FROM mcr.microsoft.com/dotnet/sdk:7.0 as build-env
WORKDIR /src

# Kopirajte sve fajlove iz trenutnog direktorijuma u /src u kontejneru
COPY . .

RUN dotnet restore
RUN dotnet publish -c Release -o /publish

FROM mcr.microsoft.com/dotnet/aspnet:7.0 as runtime
WORKDIR /publish
COPY --from=build-env /publish .
ENTRYPOINT [ "dotnet", "Analytics.dll" ]